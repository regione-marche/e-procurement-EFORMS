import { IDictionary } from '@maggioli/sdk-commons';
import { each, get, has, head, indexOf, isEmpty, isObject, lowerCase, split, toLower } from 'lodash-es';

/**
 * Classe di utilita' per il parsing dei file
 */
export class SdkDocumentUtils {
  /**
   * @ignore
   */
  private static readonly SIZES_VALUES: IDictionary<number> = {
    B: 1,
    KB: 1024,
    MB: 1048576,
    GB: 1073741824
  };

  /**
   * @ignore
   */
  private static readonly FILE_TYPES: IDictionary<string> = {
    doc: 'application/msword',
    dot: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    dotx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
    docm: 'application/vnd.ms-word.document.macroEnabled.12',
    dotm: 'application/vnd.ms-word.template.macroEnabled.12',
    xls: 'application/vnd.ms-excel',
    xlt: 'application/vnd.ms-excel',
    xla: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xltx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
    xlsm: 'application/vnd.ms-excel.sheet.macroEnabled.12',
    xltm: 'application/vnd.ms-excel.template.macroEnabled.12',
    xlam: 'application/vnd.ms-excel.addin.macroEnabled.12',
    xlsb: 'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
    ppt: 'application/vnd.ms-powerpoint',
    pot: 'application/vnd.ms-powerpoint',
    pps: 'application/vnd.ms-powerpoint',
    ppa: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    potx: 'application/vnd.openxmlformats-officedocument.presentationml.template',
    ppsx: 'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
    ppam: 'application/vnd.ms-powerpoint.addin.macroEnabled.12',
    pptm: 'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
    potm: 'application/vnd.ms-powerpoint.template.macroEnabled.12',
    ppsm: 'application/vnd.ms-powerpoint.slideshow.macroEnabled.12',
    mdb: 'application/vnd.ms-access',
    '7z': 'application/x-7z-compressed',
    xml: 'application/xml',
    pdf: 'application/pdf',
    p7m: 'application/pkcs7-mime',
    zip: 'application/zip',
    odt: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    json: 'application/json'
  };

  /**
   * Metodo per controllare la dimesione massima di un file,
   * Il metodo ritorna true se il file ha dimensione <= alla dimensione massima
   * @param file Il file da controllare
   * @param maxSize la dimensione massima ammessa nel formato X Y dove X = numero intero e Y = B | KB | MB | GB (es. 5 MB = 5 MegaByte)
   * @returns ritorna true se il file ha dimensione <= alla dimensione massima, altrimenti false
   */
  public static checkMaxFileSize(file: File, maxSize: string): boolean {
    if (isObject(file) && !isEmpty(maxSize)) {
      let realMaxSize: number = this.parseSizeToRealSize(maxSize);
      return file.size <= realMaxSize;
    }
    return false;
  }

  /**
   * Metodo per verificare la validita' della stringa di dimensione massima
   * Ritorna true quando il valore contiene -1 ignorando l'unita' di misura
   * @param maxSize Stringa di dimensione massima
   * @returns Ritorna true quando il valore contiene -1 ignorando l'unita' di misura
   */
  public static checkMalformedMaxFileSize(maxSize: string): boolean {
    if (!isEmpty(maxSize)) {
      let splitted: Array<string> = split(maxSize, ' ');
      let multiplier: number = Number.parseInt(head(splitted));
      return multiplier == -1;
    }
    return false;
  }

  /**
   * Metodo che controlla la validita' dell'estensione del file da caricare
   * @param file Il file da controllare
   * @param accept Stringa standard accept
   */
  public static checkFileExtension(file: File, accept: string): boolean {
    if (file != null && !isEmpty(accept)) {
      const validExtensions: Array<string> = SdkDocumentUtils.parseExtensions(accept);
      const currentExtension: string = file.name.split('.').pop();
      return indexOf(validExtensions, lowerCase(currentExtension)) > -1;
    }
    return true;
  }

  /**
   * Metodo che converte una dimensione human readable (es. 5 MB) in byte (es. 5 MB = 5242880 byte)
   * @param size Dimensione da convertire
   * @returns Dimensione numerica di byte
   */
  private static parseSizeToRealSize(size: string): number {
    if (!isEmpty(size)) {
      let splitted: Array<string> = split(size, ' ');
      let multiplier: number = Number.parseInt(head(splitted));
      let dimension: string = splitted[1];
      if (has(SdkDocumentUtils.SIZES_VALUES, dimension)) {
        return multiplier * get(SdkDocumentUtils.SIZES_VALUES, dimension);
      }
    }
    return 0;
  }

  /**
   * Metodo che converte la stringa standard accept in un array di estensioni
   * @param accept Stringa standard accept
   */
  private static parseExtensions(accept: string): Array<string> {
    const finalSplitted: Array<string> = new Array();
    const splitted: Array<string> = split(accept, ',');
    each(splitted, (one: string) => {
      if (one != null) {
        const newOne: string = one.trim().replace('.', '');
        finalSplitted.push(lowerCase(newOne));
      }
    });
    return finalSplitted;
  }

  /**
   * Metodo per il recupero del MIME Type dall'estensione
   * @param extension Estensione file
   */
  public static getMimeTypeFromExtension(extension: string): string {
    let mime = get(SdkDocumentUtils.FILE_TYPES, toLower(extension));
    console.log({ extension, mime });
    if (extension == null || !has(SdkDocumentUtils.FILE_TYPES, toLower(extension))) {
      return get(SdkDocumentUtils.FILE_TYPES, 'pdf');
    }
    return get(SdkDocumentUtils.FILE_TYPES, toLower(extension));
  }
}
