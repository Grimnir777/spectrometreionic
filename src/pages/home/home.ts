import { Component } from '@angular/core';
import { NavController,AlertController,ToastController } from 'ionic-angular';
import { BluetoothSerial } from "@ionic-native/bluetooth-serial";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  pairedList : pairedlist;
  listToggle : boolean = false;
  pairedDeviceID : number = 0;
  dataSend : string = "";
  dataReceived : string ="";

  constructor(
    public navCtrl: NavController,
    private alertCtrl : AlertController,
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
        this.showError("Please enable Bluetooth");
        this.listToggle = false;
      })
    }, error =>{
      this.showError("Please enable Bluetooth");
    }
    );
  }

  //onClick device
  selectDevice(){
    let connectedDevice = this.pairedList[this.pairedDeviceID];
    if(!connectedDevice.address)
    {
      this.showError("Select paired device to connect");
      return;
    }
    let address = connectedDevice.address;
    let name = connectedDevice.name;
    this.bluetoothSerial.connect(address).subscribe(success => {
      this.showError("Successfully connected");
    },
    error=>{
      this.showError("Error : connecting to the device");
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
      this.showError(error)
    });
  }

  //Toast and error message
  showError(error) {
    let alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: error,
      buttons: ['Dismiss']
    });
    alert.present();
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

