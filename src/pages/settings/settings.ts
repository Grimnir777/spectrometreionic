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
        this.showToast("Please enable Bluetooth");
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
      this.showToast("Select paired device to connect");
      return;
    }
    let address = connectedDevice.address;
    let name = connectedDevice.name;
    this.bluetoothSerial.connect(address).subscribe(success => {
      this.showToast("Successfully connected");
    },
    error=>{

    })

  }

  //onDisconnected
  deviceDisconnected() {
    this.bluetoothSerial.disconnect();
    this.showToast("Device Disconnected");
  }

  
  startAcquisition(){
    this.bluetoothSerial.write("acq").then(success => {
      this.bluetoothSerial.readUntil('\n').then((data: any) => {
        this.dataReceived = data;
        this.bluetoothSerial.clear();
      });
      this.showToast("Data received");
    }, error => {
    });
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

