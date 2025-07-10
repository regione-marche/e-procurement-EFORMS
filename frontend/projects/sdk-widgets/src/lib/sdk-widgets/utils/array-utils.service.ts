import { cloneDeep } from 'lodash-es';

export class ArrayUtils {

    public static fill(array: Array<any>, value: any): Array<any> {
        let length = array == null ? 0 : array.length;
        if (!length) {
            return [];
        }

        let start = 0;
        let end = length;

        while (start < end) {
            array[start++] = cloneDeep(value);
        }
        return array;
    }
}