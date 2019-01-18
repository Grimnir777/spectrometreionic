import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController  } from 'ionic-angular';
import { BluetoothSerial } from "@ionic-native/bluetooth-serial";
import { SaverProvider } from "../../providers/saver/saver";


import { Chart } from 'chart.js';

@Component({
  selector: 'page-acquisition',
  templateUrl: 'acquisition.html'
})
export class AcquisitionPage {
  @ViewChild('lineCanvas') lineCanvas;
  @ViewChild('absorptionPath') absorptionPath;
  @ViewChild('colorSpecter') colorSpecter;

  errorMsg : string = "Aucune erreur";
  isConnected : boolean = false;

  isNewAcquisition : boolean;

  lineChart: any;
  dataReceived : any;
  specterData: any;

  nbElements : number = 100;
  colorSpecterWidth : number;
  seuil : number = 70;

  constructor(
    public navCtrl: NavController,
    private toastCtrl : ToastController,
    private bluetoothSerial : BluetoothSerial,
    public navParams: NavParams, 
    public saver: SaverProvider,
    private alertCtrl: AlertController) 
  {
    
  }
  
  ionViewWillEnter(){
    this.bluetoothSerial.isConnected().then(() =>{
      this.isConnected = true;
    },error=>{
      this.isConnected = false;
      this.errorMsg = "Veuillez vous connecter au module bluetooth dans la page paramètres";
    });
    
  }
  ionViewDidLoad() {
    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
            {
                label: "My First dataset",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [],
                spanGaps: false,
            }
        ]
      },
      options: {
        scales: {
          xAxes: [{
            ticks: {
              min: 0,
              max: 500,
              stepSize: 100
            }
          }]
        }
      }
    });

    this.specterData = this.navParams.get('sp');
    if(this.specterData!=null)
    {
      this.isNewAcquisition = true;
      this.dataReceived = this.specterData.listValue;
      console.log(this.specterData);
      this.fillGraph();


    }
    else{
      this.isNewAcquisition = false;
    }

    //console.log(this.colorSpecter.nativeElement.getAttribute('width'));
    //console.log(this.colorSpecter.nativeElement.getAttribute('height'));

    //this.absorptionPath.nativeElement.setAttribute('d',"M150 0 L150 36 L200 36 L 200 0 Z M250 0 L250 36 L350 36 L 350 0 Z");
 }


 fillGraph(){
  this.lineChart.data.datasets[0].data=[];
  this.lineChart.data.labels=[];

  for (let index = 0; index < this.nbElements; index++) {

    this.lineChart.data.datasets[0].data.push(this.dataReceived[index]);
    this.lineChart.data.labels.push(index);
    this.lineChart.update();
  }
  this.fillColorSpecter(this.dataReceived);
 }



 saveSpecter(){
  let alert = this.alertCtrl.create({
    title: 'Sauvegarde du graphe actuel',
    message: 'Entrez un nom pour votre nouveau graphe',
    inputs: [
      {
        name: 'title',
        placeholder: 'titre'
      },
    ],
    buttons: [
      {
        text: 'Annuler',
        handler: () => {
          console.log('Cancel clicked');
        }
      },
      {
        text: 'Sauvegarder',
        handler: (data) => {
          console.log('Saved clicked');
          if(data.title!=null && data.title!=""){
            let acDate = Date.now();
            let newName = data.title;
            let newSpecter = {
              id : newName + acDate,
              date : acDate,
              name : newName,
              listValue : this.dataReceived
            };
            console.log(newSpecter);
            this.saver.addSpecter(newSpecter);
            this.showToast("Votre graphe (" + data.title + ") a bien été sauvegardé",2500) 
          }
          
        }
      }
    ]
  });

  alert.present();
  
 
 }

  //simulation of data
  startAcquisition2(){
    this.dataReceived = [];
    this.lineChart.data.datasets[0].data=[];
    this.lineChart.data.labels=[];
    
    for (let index = 0; index < this.nbElements; index++) {
      let data = (Math.floor(Math.random() * Math.floor(100)) +(index-30));
      this.dataReceived.push(data);
      this.lineChart.data.datasets[0].data.push(data);
      this.lineChart.data.labels.push(index);
      this.lineChart.update();
    }
    this.fillColorSpecter(this.dataReceived);
    //console.log(this.dataReceived);
  }

  fillColorSpecter(tabValues){
    this.colorSpecterWidth = this.colorSpecter.nativeElement.getAttribute('width');
    let pas = this.colorSpecterWidth / this.nbElements;

    let newPath = "";

    for (let i = 0; i < tabValues.length; i++) {
      if(tabValues[i]>this.seuil)
      {
        //M150 0 L150 36 L200 36 L 200 0 Z M250 0 L250 36 L350 36 L 350 0 Z
        newPath += "M" + i*pas + " 0 L" + i*pas + " 36 L" + (i+1)*pas +  " 36 L " + (i+1)*pas +" 0 Z";
      }
      
    }

    this.absorptionPath.nativeElement.setAttribute('d',newPath);

  }

  startAcquisition(){
    this.bluetoothSerial.write("acq").then(success => {
      this.bluetoothSerial.readUntil('\n').then((data: any) => {
        this.dataReceived = data.split(',');
        console.log(this.dataReceived);

        this.dataReceived.forEach(function (value, i) {
          this.lineChart.data.datasets[0].data.push(parseFloat(value));
          this.lineChart.data.labels.push(i);
          this.lineChart.update();

        });

        this.bluetoothSerial.clear();
      });
      this.showToast("Data received",1000);
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

}
