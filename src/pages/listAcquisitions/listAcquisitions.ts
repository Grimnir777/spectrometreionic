import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SaverProvider } from "../../providers/saver/saver";
import { AcquisitionPage } from "../../pages/acquisition/acquisition";

@Component({
  selector: 'page-listAcquisitions',
  templateUrl: 'listAcquisitions.html'
})
export class ListAcquisitionsPage {

  private allSpecters = [];

  constructor(public navCtrl: NavController, public saver: SaverProvider) {
  }

  ionViewWillEnter(){
    this.saver.getAllSpecters().subscribe( specters =>{
      this.allSpecters = specters;
      console.log(this.allSpecters);
    });
  }

  openAcq(specter){
    this.navCtrl.push(AcquisitionPage, {sp : specter});
  }

  delete(index)
  {
    this.saver.removeSpecter(index);
    this.allSpecters[index] = null;
    this.allSpecters.splice(index,1);
  }

}
