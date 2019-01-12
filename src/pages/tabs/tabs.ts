import { Component } from '@angular/core';

import { AcquisitionPage } from '../acquisition/acquisition';
import { ListAcquisitionsPage } from '../listAcquisitions/listAcquisitions';
import { SettingsPage } from '../settings/settings';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = AcquisitionPage;
  tab2Root = ListAcquisitionsPage;
  tab3Root = SettingsPage;

  constructor() {}
}
