import { Component } from '@angular/core';
import { NavController, NavParams ,LoadingController ,ToastController } from 'ionic-angular';
import { SaverProvider } from "../../providers/saver/saver";
import { BluetoothSerial } from "@ionic-native/bluetooth-serial";

const LONG_ONDE_ROUGE = 638;


@Component({
  selector: 'page-calibration',
  templateUrl: 'calibration.html',
})
export class CalibrationPage {
  dataReceived : any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public saver: SaverProvider,
    private bluetoothSerial : BluetoothSerial,
    public loadingCtrl: LoadingController,
    private toastCtrl : ToastController) {
  }

  ionViewDidLoad() {
  }

  turnLeft(){
    this.bluetoothSerial.clear();
    this.bluetoothSerial.write("left").then(success => {
    }, error => {
      this.showToast(error,1000)
    });
  }
  turnRight(){
    this.bluetoothSerial.clear();
    this.bluetoothSerial.write("right").then(success => {
    }, error => {
      this.showToast(error,1000)
    });
  }






  startCalibration(){
    var loading = this.loadingCtrl.create({
      spinner: 'crescent',
      content: 'Acquisition en cours ...'
    });

    loading.present();
    while(this.dataReceived == [])
    {
      this.bluetoothSerial.write("acq").then(success => {
        this.bluetoothSerial.readUntil('\n').then((data: any) => {
          this.dataReceived = data.split(',');
          this.dataReceived.forEach(function(element) {
            element = parseFloat(element);
          });
          this.bluetoothSerial.clear();
          //let valMax = Math.max(...this.dataReceived);
          let indexOfMax = this.indexOfMax(this.dataReceived)
          let valCalib = {
            pos_moteur : indexOfMax,
            longueur_onde : LONG_ONDE_ROUGE
          }
          this.saver.setCalibValues(valCalib)
          loading.dismiss();
        });
        this.showToast("Data received",1000);
      }, error => {
        this.showToast(error,1000)
      });
    }
  }
  showToast(msj,time) {
    const toast = this.toastCtrl.create({
      message: msj,
      duration: time
    });
    toast.present();
  }


  indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
  }

}
