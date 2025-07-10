package it.appaltiecontratti.meforms.sorting;

import com.fasterxml.jackson.databind.JsonNode;
import eu.europa.ted.eforms.sdk.SdkVersion;
import it.appaltiecontratti.meforms.helpers.VersionHelper;
import it.appaltiecontratti.meforms.helpers.notice.DocumentTypeInfo;
import it.appaltiecontratti.meforms.helpers.notice.FieldsAndNodes;
import it.appaltiecontratti.meforms.helpers.notice.PhysicalModel;
import it.appaltiecontratti.meforms.util.JsonUtils;
import it.appaltiecontratti.meforms.util.XmlUtils;
import it.appaltiecontratti.meforms.util.XpathUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.Validate;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

import javax.xml.xpath.XPath;
import java.io.IOException;
import java.nio.file.Path;
import java.util.*;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 23, 2024
 *
 * Sorts notice XML tags (elements) in the order defined by the corresponding SDK XSD sequences.
 *
 * <p>
 * NOTE: For a sample usage there are a unit tests which uses this.
 * </p>
 */
@Slf4j
public class NoticeXmlTagSorter {
    private final DocumentTypeInfo docTypeInfo;
    private final Path sdkFolder;
    private final XPath xpathInst;
    private final FieldsAndNodes fieldsAndNodes;

    /**
     * The instance is reusable but specific to a given SDK version.
     *
     * @param xpathInst Reusable xpath preconfigured instance
     * @param docTypeInfo SDK document type info
     * @param sdkFolder The folder of the downloaded SDK
     * @param fieldsAndNodes The SDK fields and nodes metadata (including sort order)
     */
    public NoticeXmlTagSorter(final XPath xpathInst,
                              final DocumentTypeInfo docTypeInfo, final Path sdkFolder,
                              final FieldsAndNodes fieldsAndNodes) {

        Validate.notNull(xpathInst);
        Validate.notNull(docTypeInfo);
        Validate.notNull(sdkFolder);
        Validate.notNull(fieldsAndNodes);

        // SDK specific.
        this.docTypeInfo = docTypeInfo;
        this.xpathInst = xpathInst;
        this.sdkFolder = sdkFolder;

        this.fieldsAndNodes = fieldsAndNodes;
    }

    /**
     * Sorts the passed notice XML document starting from the root. This depends on the SDK version of
     * the notice.
     *
     * @param doc A notice XML as a W3C DOM.
     *
     * @throws SAXException If any parse error occurs.
     * @throws IOException If any IO error occurs.
     */
    public void sortXml(final Document doc) throws SAXException, IOException {
        sortXml(doc.getDocumentElement());
    }

    /**
     * Sorts the passed notice XML elements and sub-elements. This depends on the SDK version of the
     * notice.
     *
     * @param xmlRoot The xml root element is the entry point
     * @throws SAXException If any parse error occurs.
     * @throws IOException If any IO error occurs.
     */
    public void sortXml(final Element xmlRoot) throws SAXException, IOException {

        final String cbcCustomizationId = PhysicalModel.CBC_CUSTOMIZATION_ID;
        // Compare sdkVersion of the element to the SDK version of this instance.
        final Element customizationElem =
                XmlUtils.getDirectChild(xmlRoot, cbcCustomizationId);
        if (customizationElem == null) {
            throw new RuntimeException(
                    String.format(
                            "Failed to find field=%s, the physical model is probably not well formed. xmlRoot=%s",
                            cbcCustomizationId, xmlRoot));
        }

        final String sdkVersionOfNoticeStr = customizationElem.getTextContent();
        final SdkVersion sdkVersionOfNotice =
                VersionHelper.parsePrefixedSdkVersion(sdkVersionOfNoticeStr);
        final SdkVersion sdkVersionOfSorter = getSorterSdkVersion();
        if (!VersionHelper.equalsVersionWithoutPatch(sdkVersionOfSorter, sdkVersionOfNotice)) {
            throw new RuntimeException(
                    String.format("Incompatible version: sorterInstance=%s, noticeToSort=%s",
                            sdkVersionOfSorter, sdkVersionOfNotice));
        }

        log.info("Attempting to sort tags in the XML, starting from root element={}",
                xmlRoot.getTagName());
        log.info("XML uri={}", xmlRoot.getOwnerDocument().getBaseURI());

        // Start from root node.
        final JsonNode rootNode = this.fieldsAndNodes.getRootNode();

        final Map<String, List<JsonNode>> fieldOrNodeByParentNodeId =
                fieldsAndNodes.buildMapOfFieldOrNodeByParentNodeId();

        //
        // HOW TO HANDLE SUCH A SPECIAL CASE.
        //
        // {
        // "id" : "ND-SubcontractedActivity",
        // "parentId" : "ND-LotTender",
        // "xpathRelative" : "efac:SubcontractingTerm",
        // }, {
        // "id" : "ND-SubcontractedContract",
        // "parentId" : "ND-LotTender",
        // "xpathRelative" : "efac:SubcontractingTerm[efbc:TermCode/@listName='applicability']",
        // }
        // This is problematic for my algorithm, two nodes lead to the same xml element
        // The predicate in the parent element is about the child item ...
        //
        final List<JsonNode> listSubcontractedActivity =
                fieldOrNodeByParentNodeId.get("ND-SubcontractedActivity");
        if (listSubcontractedActivity != null) {
            final List<JsonNode> listSubcontractedContract =
                    fieldOrNodeByParentNodeId.get("ND-SubcontractedContract");
            if (listSubcontractedContract != null) {
                // The context of ND-SubcontractedActivity is broader than for ND-SubcontractedContract.
                // We want to group them.
                listSubcontractedActivity.addAll(listSubcontractedContract);
                listSubcontractedContract.clear();
            }
        }

        // Those can be of interest in case the sort order differs.
        logSpecialCases(fieldOrNodeByParentNodeId);

        sortRecursive(xmlRoot, rootNode, fieldOrNodeByParentNodeId);
        // NOTE: we do not normalize the document, this can be done later if desired.
    }

    private void logSpecialCases(final Map<String, List<JsonNode>> fieldOrNodeByParentNodeId) {
        final Map<String, JsonNode> map = new HashMap<>();
        for (final Map.Entry<String, List<JsonNode>> entry : fieldOrNodeByParentNodeId.entrySet()) {
            final String nodeId = entry.getKey();
            if (nodeId.equals(FieldsAndNodes.ND_ROOT)) {
                continue;
            }
            final JsonNode node = fieldsAndNodes.getNodeById(nodeId);
            final String parentNodeId = JsonUtils.getTextStrict(node, FieldsAndNodes.NODE_PARENT_NODE_ID);

            final String xpathRel = JsonUtils.getTextStrict(node, FieldsAndNodes.XPATH_RELATIVE);
            final List<String> xpathList =
                    Arrays.asList(XpathUtils.getXpathPartsWithoutPredicates(xpathRel));
            final String xpathRelWithoutPredicate = xpathList.get(0);
            if (map.containsKey(xpathRelWithoutPredicate)) {
                final JsonNode nodeOther = map.get(xpathRelWithoutPredicate);

                final String nodeIdOther =
                        JsonUtils.getTextStrict(nodeOther, FieldsAndNodes.FIELD_OR_NODE_ID_KEY);

                final String parentNodeIdOther =
                        JsonUtils.getTextStrict(nodeOther, FieldsAndNodes.NODE_PARENT_NODE_ID);

                final String otherXpathRel =
                        JsonUtils.getTextStrict(nodeOther, FieldsAndNodes.XPATH_RELATIVE);

                if (parentNodeId.equals(parentNodeIdOther) && !nodeId.equals(nodeIdOther)
                        && (otherXpathRel.startsWith(xpathRel) || xpathRel.startsWith(otherXpathRel))) {
                    // This can happen when only the predicate differs.
                    log.debug("{} has same element as other nodeId={}", nodeId, nodeIdOther);

                    // In that case we expect the sort order to be the same!

                    final List<JsonNode> nodeList =
                            JsonUtils.getList(node.get(FieldsAndNodes.XSD_SEQUENCE_ORDER_KEY));

                    final List<JsonNode> nodeOtherList =
                            JsonUtils.getList(nodeOther.get(FieldsAndNodes.XSD_SEQUENCE_ORDER_KEY));

                    if (!nodeList.equals(nodeOtherList)) {
                        log.warn(
                                "Sort order differs for nodeId1={}, nodeId2={}, but they have the same element",
                                nodeId, nodeIdOther);
                    }
                }
            }

            map.put(xpathRelWithoutPredicate, node);
        }
    }

    /**
     * @param xmlRootElem The XML root element to sort (physical model), children of this element will
     *        be sorted
     * @param fieldOrNode Field or node (conceptual model), initially the root node
     * @param fieldOrNodeByParentNodeId List of fields or nodes by parent node id
     */
    public void sortRecursive(final Element xmlRootElem, final JsonNode fieldOrNode,
                              final Map<String, List<JsonNode>> fieldOrNodeByParentNodeId) {
        Validate.notNull(xmlRootElem);
        Validate.notNull(fieldOrNode);

        final String id = JsonUtils.getTextStrict(fieldOrNode, FieldsAndNodes.FIELD_OR_NODE_ID_KEY);
        final String xpathAbsolute =
                JsonUtils.getTextStrict(fieldOrNode, FieldsAndNodes.XPATH_ABSOLUTE);

        // All the fields or nodes found under the same parent.
        // Example:
        // id = "ND-BusinessParty" but in the XML it is "cac:BusinessParty"
        // We want the XML child elements of "cac:BusinessParty" in the correct xsd sequence order.
        final List<JsonNode> childItems = fieldOrNodeByParentNodeId.get(id);
        if (childItems == null) {
            return; // Nothing to sort.
        }
        log.debug("Sorting children of id={}", id);

        // Get sort order of child items for the current node id.
        final List<OrderItem> orderItemsForParent = new ArrayList<>(childItems.size());
        for (final JsonNode childItem : childItems) {

            final String fieldOrNodeId =
                    JsonUtils.getTextStrict(childItem, FieldsAndNodes.FIELD_OR_NODE_ID_KEY);
            log.debug("Found child fieldOrNodeId={}", fieldOrNodeId);

            final String xpathRel = JsonUtils.getTextStrict(childItem, FieldsAndNodes.XPATH_RELATIVE);
            final List<String> xpathRelParts = XpathUtils.getXpathParts(xpathRel);
            Validate.notEmpty(xpathRelParts);

            final List<JsonNode> list =
                    JsonUtils.getList(childItem.get(FieldsAndNodes.XSD_SEQUENCE_ORDER_KEY));

            // The sort order is always missing for the root node.
            // It can also be missing in SDK 1.7 but not in SDK 1.8.
            if (!list.isEmpty()) {
                final JsonNode firstItemInOrder = list.get(0);
                final String key = firstItemInOrder.fieldNames().next();
                // final String keyWithPredicate = xpathRelFirst;
                final int order = firstItemInOrder.get(key).asInt();
                final OrderItem orderItem = new OrderItem(fieldOrNodeId, key, order);
                orderItemsForParent.add(orderItem);
            } else {
                log.warn("parentId={}, itemId={} has no {}", id, fieldOrNodeId,
                        FieldsAndNodes.XSD_SEQUENCE_ORDER_KEY);
                // Ideally we want this to throw, but some tests are using dummy data that is missing the
                // sort order and the tests are not about the order.
                // throw new RuntimeException(
                // String.format("%s is not supported in used SDK version! fieldOrNodeId=%s",
                // FieldsAndNodes.XSD_SEQUENCE_ORDER_KEY, id));
            }
        }
        // The order items are not ordered yet, they contain the order, and we naturally sort on it.
        Collections.sort(orderItemsForParent); // Relies on implementation of "Comparable".
        log.debug("orderItemsForParent=" + orderItemsForParent);

        //
        // Find parent elements in the XML.
        //
        final List<Element> xmlParentElements =
                XmlUtils.evaluateXpathAsElemList(xpathInst, xmlRootElem, xpathAbsolute, xpathAbsolute);

        for (final Element xmlParentElement : xmlParentElements) {

            // Find child elements relative to the parent context.
            final Element xpathContext = xmlParentElement;

            for (final OrderItem orderItem : orderItemsForParent) {

                // We still need to parse the relative xpath.
                final String xpathExpr = orderItem.getXmlName();

                // TODO split xpath relative of children "/abc[xyz]"
                // order only provides "abc"
                // map index to order

                final List<Element> foundChildElements =
                        XmlUtils.evaluateXpathAsElemList(xpathInst, xpathContext, xpathExpr, xpathExpr);

                // Reorder XML elements.
                // Also note that XML attributes have no order.
                for (final Element foundChildElement : foundChildElements) {

                    // PRESERVE POSITION OF COMMENTS OR XML TEXTS NODES (formatting...).
                    // Find comments or text nodes above the element.
                    final List<Node> commentsOrTextsAbove = new ArrayList<>();
                    Node previousSibling = foundChildElement.getPreviousSibling();
                    while (previousSibling != null) {
                        if (previousSibling.getNodeType() == Node.TEXT_NODE) {
                            commentsOrTextsAbove.add(previousSibling);
                        } else if (previousSibling.getNodeType() == Node.COMMENT_NODE) {
                            commentsOrTextsAbove.add(previousSibling);
                        } else {
                            break;
                        }
                        previousSibling = previousSibling.getPreviousSibling();
                    }
                    Collections.reverse(commentsOrTextsAbove); // To keep the original order.

                    // First add back the XML comments.
                    for (final Node commentOrTextAbove : commentsOrTextsAbove) {
                        removeAndAppend(xpathContext, commentOrTextAbove);
                    }

                    // This sorts the xml elements by removing them and appending them back.
                    removeAndAppend(xpathContext, foundChildElement);
                }
            }
        }

        // Continue on child items in the field and node hierarchy.
        for (final JsonNode childItem : childItems) {
            sortRecursive(xmlRootElem, childItem, fieldOrNodeByParentNodeId);
        }
    }

    /**
     * @return The path of the main XSD file, this is not supported in some older versions, in that
     *         case it returns empty.
     */
    public Optional<Path> getMainXsdPathOpt() {
        final Optional<String> sdkXsdPathOpt = this.docTypeInfo.getSdkXsdPathOpt();
        if (sdkXsdPathOpt.isEmpty()) {
            log.info("Sorting not supported for version={}", getSorterSdkVersion());
            return Optional.empty();
        }
        return Optional.of(sdkFolder.resolve(sdkXsdPathOpt.get()));
    }

    private SdkVersion getSorterSdkVersion() {
        return docTypeInfo.getSdkVersion();
    }

    /**
     * @param elemParent The element in which to append
     * @param elemToSort The element to remove and append
     */
    private static void removeAndAppend(final Element elemParent, final Node elemToSort) {
        elemParent.removeChild(elemToSort); // Removes child from old location.
        elemParent.appendChild(elemToSort); // Appends child at the new location.
    }
}
