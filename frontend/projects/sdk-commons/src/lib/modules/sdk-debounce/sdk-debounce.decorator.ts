import { debounce } from 'lodash-es';

export function SdkDebounce(time = 10, leading = true, trailing = true): MethodDecorator {
  return (_target: any, _key: any, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = debounce(originalMethod, time, { leading, trailing });
    return descriptor;
  };
};

export function SdkDebounceCancel(func: IRewriteFunc) {
  try { if (func && func.options) { clearTimeout(func.options.timer) } } catch (e) { }
}

interface IRewriteFuncOption { timer: any; lastArgs: any[] }

interface IRewriteFunc { (...rewriteArgs: any): void; options: IRewriteFuncOption }
