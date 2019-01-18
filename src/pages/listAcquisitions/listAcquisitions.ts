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

  createTest(){
    let listValue = [];
    for (let index = 0; index < 100; index++) {
      listValue.push( (Math.floor(Math.random() * Math.floor(100)) +(index-30)) );
    }
    console.log(listValue);
    let acDate = Date.now();
    let newName = 'newSpecter';
    let newE = {
      id : newName + acDate,
      date : acDate,
      name : newName,
      listValue : listValue
    };
    console.log(newE);
    this.saver.addSpecter(newE);
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
  /*
  Modele données
  date
  name
  listValue [{400:50},{401:56},...,{1000:30}]
  id = name + date
  */

}
