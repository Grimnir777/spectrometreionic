import { Component } from '@angular/core';
import { NavController,ToastController,LoadingController } from 'ionic-angular';
import { BluetoothSerial } from "@ionic-native/bluetooth-serial";

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})

export class SettingsPage {
  listToggle : boolean = false;
  isConnected: boolean = false;
  pairedList : pairedlist;
  pairedDeviceID : number = 0;
  unpairedList : pairedlist;
  unpairedDeviceID : number = 0;

  bluetoothOn : boolean = false;

  constructor(
    public navCtrl: NavController,
    private toastCtrl : ToastController,
    private bluetoothSerial : BluetoothSerial,
    public loadingCtrl: LoadingController
    ) 
  {
    this.checkBluetoothEnable();
    this.bluetoothSerial.isConnected().then(success=>{
      console.log("connected");
      this.isConnected = true;
    },error => {
      console.log("not connected")
      this.isConnected = false;
    })
  }

  enableBluetooth()
  {
    this.bluetoothSerial.enable().then(success =>{
      this.showToast("Activation du bluetooth réussie");
      this.bluetoothOn = true;
      this.checkBluetoothEnable();
    },error => {
      this.showToast("Activation du bluetooth impossible");
      this.bluetoothOn = false;
    })
  }

  //At initialization
  checkBluetoothEnable(){
    this.bluetoothSerial.isEnabled().then(success =>{
      this.bluetoothOn = true;
      this.bluetoothSerial.list().then(success=>{
        this.pairedList = success;
        this.listToggle = true;
      },error => {
        this.showToast("Erreur pendant le chargement des appareils");
        this.listToggle = false;
      })
    }, error =>{
      this.bluetoothOn = false;
      this.showToast("Veuillez activer le bluetooth");
    }
    );
  }

  scanForUnpaired()
  {
    this.bluetoothSerial.discoverUnpaired().then(success=>{
      this.unpairedList = success;
    },error => {
      this.showToast("Erreur pendant le scan");
    })
  }

  //onClick device
  selectDevice(){
    var loading = this.loadingCtrl.create({
      spinner: 'crescent',
      showBackdrop: false,
      cssClass: "loading-ctrl",
      content: 'Connexion en cours'
    });

    loading.present();

    let connectedDevice = this.pairedList[this.pairedDeviceID];
    if(!connectedDevice.address)
    {
      this.showToast("Veuillez choisir un appareil auquel se connecter");
      return;
    }
    let address = connectedDevice.address;
    //let name = connectedDevice.name;
    this.bluetoothSerial.connect(address).subscribe(success => {
      this.showToast("Connexion réussie");
      loading.dismiss();
      this.isConnected = true;
    },
    error=>{
      this.showToast("Connexion impossible");
      loading.dismiss();
      this.isConnected = false;
    })
  }

  //onClick device
  selectDeviceUnpaired(){
    let connectedDevice = this.unpairedDeviceID[this.unpairedDeviceID];
    if(!connectedDevice.address)
    {
      this.showToast("Veuillez choisir un appareil auquel se connecter");
      return;
    }
    let address = connectedDevice.address;
    let name = connectedDevice.name;
    this.bluetoothSerial.connect(address).subscribe(success => {
      this.showToast("Connexion réussie à : " + name);
    },
    error=>{
      this.showToast("Connexion impossible");
    })
  }

  //onDisconnected
  deviceDisconnected() {
    this.bluetoothSerial.disconnect();
    this.isConnected = false;
    this.showToast("Appareil déconnecté");
  }

  showToast(msj) {
    const toast = this.toastCtrl.create({
      message: msj,
      duration: 1000
    });
    toast.present();
  }

}

interface pairedlist {
  "class": number,
  "id": string,
  "address": string,
  "name": string
}

