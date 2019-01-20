import { Component } from '@angular/core';
import { NavController,ToastController } from 'ionic-angular';
import { BluetoothSerial } from "@ionic-native/bluetooth-serial";

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})

export class SettingsPage {
  pairedList : pairedlist;
  listToggle : boolean = false;
  pairedDeviceID : number = 0;
  dataSend : string = "";
  dataReceived : string ="";

  constructor(
    public navCtrl: NavController,
    private toastCtrl : ToastController,
    private bluetoothSerial : BluetoothSerial
    ) 
  {
    this.checkBluetoothEnable();
  }

  //At initialization
  checkBluetoothEnable(){
    this.bluetoothSerial.isEnabled().then(success =>{
      this.bluetoothSerial.list().then(success=>{
        this.pairedList = success;
        this.listToggle = true;
      },error => {
        this.showToast("Veuillez activer le bluetooth");
        this.listToggle = false;
      })
    }, error =>{
      //this.showToast("Please enable Bluetooth");
    }
    );
  }

  //onClick device
  selectDevice(){
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
    },
    error=>{

    })

  }

  //onDisconnected
  deviceDisconnected() {
    this.bluetoothSerial.disconnect();
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

