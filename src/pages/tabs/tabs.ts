import { Component } from '@angular/core';

import { NewAcquisitionPage } from '../new-acquisition/new-acquisition';
import { ListAcquisitionsPage } from '../listAcquisitions/listAcquisitions';
import { CalibrationPage } from '../calibration/calibration';
import { SettingsPage } from '../settings/settings';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = NewAcquisitionPage;
  tab2Root = ListAcquisitionsPage;
  tab3Root = CalibrationPage;
  tab4Root = SettingsPage;

  constructor() {}
}
