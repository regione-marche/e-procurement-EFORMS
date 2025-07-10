import { HttpClient } from '@angular/common/http';
import { ModuleWithProviders } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

export abstract class SdkModuleHelper {

    public static translateModule(createTranslateLoader: () => void): ModuleWithProviders<any> {
        return TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        });
    }

}
