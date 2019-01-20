import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AcquisitionPage } from '../pages/acquisition/acquisition';
import { ListAcquisitionsPage } from '../pages/listAcquisitions/listAcquisitions';
import { CalibrationPage } from "../pages/calibration/calibration";
import { SettingsPage } from '../pages/settings/settings';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { BluetoothSerial } from "@ionic-native/bluetooth-serial";
import { SaverProvider } from '../providers/saver/saver';
import { IonicStorageModule } from '@ionic/storage';
import { File } from "@ionic-native/file";


@NgModule({
  declarations: [
    MyApp,
    AcquisitionPage,
    ListAcquisitionsPage,
    CalibrationPage,
    SettingsPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AcquisitionPage,
    ListAcquisitionsPage,
    CalibrationPage,
    SettingsPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BluetoothSerial,
    File,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    SaverProvider
  ]
})
export class AppModule {}
