import { Component } from '@angular/core';
import { NavController, NavParams ,LoadingController ,ToastController } from 'ionic-angular';
import { SaverProvider } from "../../providers/saver/saver";
import { BluetoothSerial } from "@ionic-native/bluetooth-serial";

const LONG_ONDE_ROUGE = 638;

const MIN_PAS_VERT = 100;
const MAX_PAS_VERT = 200;
const MIN_PAS_ROUGE = 200;
const MAX_PAS_ROUGE = 400;


const NB_ACQUISITIONS = 600;


@Component({
  selector: 'page-calibration',
  templateUrl: 'calibration.html',
})
export class CalibrationPage {
  dataReceivedVert : any = [];
  dataReceivedRouge : any = [];

  valCalib : any;

  cmdPas:number;
  posRougeSaved : number;
  posVertSaved : number;

  indexCurrentR : number;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public saver: SaverProvider,
    private bluetoothSerial : BluetoothSerial,
    public loadingCtrl: LoadingController,
    private toastCtrl : ToastController) {
  }

  ionViewWillEnter(){
    this.saver.getCalibValues().subscribe( calibValues =>{
      this.valCalib = calibValues;
      console.log(this.valCalib);
      this.posRougeSaved = this.valCalib['POS_ROUGE'];
      this.posVertSaved = this.valCalib['POS_VERT'];
    });
  }

  ionViewDidLoad() {
  }

  turnLeft(){
    this.bluetoothSerial.clear();
    this.bluetoothSerial.write("left-"+this.cmdPas).then(success => {
    }, error => {
      this.showToast(error,1000)
    });
  }
  turnRight(){
    this.bluetoothSerial.clear();
    this.bluetoothSerial.write("right-"+this.cmdPas).then(success => {
    }, error => {
      this.showToast(error,1000)
    });
  }

  raz(){
    this.bluetoothSerial.clear();
    this.bluetoothSerial.write("raz").then(success => {
    }, error => {
      this.showToast(error,1000)
    });
  }


  calibrationVerte(){
    this.dataReceivedVert=[]
    for (let i = 0; i < NB_ACQUISITIONS; i++) {
      this.dataReceivedVert.push(0.0);
    }
    var loading = this.loadingCtrl.create({
      spinner: 'crescent',
      content: 'Acquisition en cours'
    });

    loading.present();
    this.bluetoothSerial.clear();
    this.bluetoothSerial.write("acq").then(success => {
      this.indexCurrentR = 0;
      this.bluetoothSerial.subscribe('\n').subscribe((data:any)=>{
        this.dataReceivedVert[NB_ACQUISITIONS - this.indexCurrentR] = parseFloat(data);
        this.indexCurrentR++;
        if(this.indexCurrentR >= NB_ACQUISITIONS)
        {
          loading.dismiss();
          this.posVertSaved = this.indexOfMax(this.dataReceivedVert,MIN_PAS_VERT,MAX_PAS_VERT);
          this.valCalib['POS_VERT'] = this.posVertSaved;
          this.saver.setCalibValues(this.valCalib);
          this.showToast("MAJ position laser vert ok",1000)
        }
      });
    }, error => {
      this.showToast(error,1000)
    });
    
  }

  calibrationRouge(){
    this.dataReceivedRouge=[]
    for (let i = 0; i < NB_ACQUISITIONS; i++) {
      this.dataReceivedRouge.push(0.0);
    }
    var loading = this.loadingCtrl.create({
      spinner: 'crescent',
      content: 'Acquisition en cours'
    });

    loading.present();
      this.bluetoothSerial.clear();
      this.bluetoothSerial.write("acq").then(success => {
        this.indexCurrentR = 0;
        this.bluetoothSerial.subscribe('\n').subscribe((data:any)=>{
          this.dataReceivedRouge[NB_ACQUISITIONS - this.indexCurrentR] = parseFloat(data);
          this.indexCurrentR++;
          if(this.indexCurrentR >= NB_ACQUISITIONS)
          {
            loading.dismiss();
            this.posRougeSaved = this.indexOfMax(this.dataReceivedRouge,MIN_PAS_ROUGE,MAX_PAS_ROUGE);
            this.valCalib['POS_ROUGE'] = this.posRougeSaved;
            this.saver.setCalibValues(this.valCalib);
            this.showToast("MAJ position laser rouge ok",1000)
          }
        });
      }, error => {
        this.showToast(error,1000)
      });
  }

  showToast(msj,time) {
    const toast = this.toastCtrl.create({
      message: msj,
      duration: time
    });
    toast.present();
  }


  indexOfMax(tab,indexStart,indexEnd) {
    if (tab.length === 0) {
      return -1;
    }
    if (indexEnd<indexStart) {
      return -1;
    }

    var max = tab[indexStart];
    var maxIndex = indexStart;

    for (var i = indexStart+1; i < indexEnd; i++) {
      if (tab[i] > max) {
        maxIndex = i;
        max = tab[i];
      }
    }
    return maxIndex;
  }

}
