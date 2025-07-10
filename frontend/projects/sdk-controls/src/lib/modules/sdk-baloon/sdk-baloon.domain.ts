import { Type } from '@angular/core';

/**
 * Interfaccia di configurazione del baloon
 */
export interface SdkBaloonConfig {

  /**
   * @ignore
   */
  pos?: string;

  /**
   * @ignore
   */
  dim?: string;

  /**
   * @ignore
   */
  back?: boolean;

  /**
   * @ignore
   */
  html?: Type<any>;

  /**
   * @ignore
   */
  input?: Function;

  /**
   * @ignore
   */
  output?: Function;

  /**
   * @ignore
   */
  disabled?: Function;

  /**
   * @ignore
   */
  frameTop?: number;

  /**
   * @ignore
   */
  frameBottom?: number;

  /**
   * @ignore
   */
  responsive?: SdkBaloonResponsiveConfig

}

/**
 * Interfaccia di configurazione responsiva del baloon
 */
export interface SdkBaloonResponsiveConfig {

  /**
   * @ignore
   */
  media: 'LT_XL' | 'LT_L' | 'LT_M' | 'LT_S';

  /**
   * @ignore
   */
  pos?: string;

  /**
   * @ignore
   */
  dim?: string;

}

