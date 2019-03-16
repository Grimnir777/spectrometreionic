import { Component,ViewChild } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController, LoadingController  } from 'ionic-angular';
import { BluetoothSerial } from "@ionic-native/bluetooth-serial";
import { File } from "@ionic-native/file";
import { SaverProvider } from "../../providers/saver/saver";
import { Chart } from 'chart.js';


@Component({
  selector: 'page-new-acquisition',
  templateUrl: 'new-acquisition.html',
})
export class NewAcquisitionPage {
  @ViewChild('lineCanvas') lineCanvas;
  @ViewChild('absorptionPath') absorptionPath;
  @ViewChild('colorSpecter') colorSpecter;


  errorMsg : string = "Aucune erreur";
  isConnected : boolean = false;


  isSaved : boolean;
  isNewAcq : boolean;


  lineChart: any;
  dataReceived : any;
  specterData: any;

  nbElements : number = 100;
  colorSpecterWidth : number;
  seuil : number = 70;

  indexCurrentR : number = 0;


  constructor(
    public navCtrl: NavController,
    private toastCtrl : ToastController,
    private bluetoothSerial : BluetoothSerial,
    public navParams: NavParams, 
    public saver: SaverProvider,
    private alertCtrl: AlertController,
    private file: File,
    public loadingCtrl: LoadingController) 
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

  
  ionViewDidEnter() {
    this.initGraph();
    this.isNewAcq = true;      
    this.isSaved = false;
 }

 initGraph(){
  this.lineChart = new Chart(this.lineCanvas.nativeElement, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
          {
            label: 'Nouvelle acquisition',
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
 }

 fillGraph(){
  for (let index = 0; index < this.dataReceived.length; index++) {
    this.lineChart.data.datasets[0].data[index] = this.dataReceived[index];
    this.lineChart.data.labels[index] = index;
    this.lineChart.update();
  }
  this.fillColorSpecter();
 }

 fillColorSpecter(){
    this.colorSpecterWidth =  this.colorSpecter.nativeElement.getAttribute('viewBox').split(" ")[2];
    let pas = this.colorSpecterWidth / this.dataReceived.length;
    
    let newPath = "";

    for (let i = 0; i < this.dataReceived.length; i++) {
      if(this.dataReceived[i]>this.seuil)
      {
        newPath += "M" + i*pas + " 0 L" + i*pas + " 36 L" + (i+1)*pas +  " 36 L " + (i+1)*pas +" 0 Z";
      }
    }

    this.absorptionPath.nativeElement.setAttribute('d',newPath);
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
            this.specterData = newSpecter;
            console.log(newSpecter);
            this.saver.addSpecter(newSpecter);
            this.showToast("Votre graphe (" + data.title + ") a bien été sauvegardé",2500);
            this.isSaved = true;
          }
          
        }
      }
    ]
  });

  alert.present();
 }


  startAcquisition(){
    this.isNewAcq = true;
    this.isSaved = false;

    var loading = this.loadingCtrl.create({
      spinner: 'crescent',
      content: 'Acquisition en cours'
    });

    loading.present();
    this.bluetoothSerial.clear();
    this.bluetoothSerial.write("acq").then(success => {
      this.indexCurrentR = 0;
      this.dataReceived = [];
      this.bluetoothSerial.subscribe('\n').subscribe((data:any)=>{

        console.log(data);
        this.dataReceived.push(parseFloat(data));
        this.indexCurrentR++;
        console.log(this.indexCurrentR);
        if(this.indexCurrentR >= 1000)
        {
          loading.dismiss();
          console.log(this.dataReceived);
          this.fillGraph();
        }
      });
    }, error => {
      this.showToast(error,1000)
    });
    
  }


  saveAsCsv() {
    let alert = this.alertCtrl.create({
      title: 'Sauvegarde du graphe en CSV',
      message: 'Entrez un nom pour votre fichier csv',
      inputs: [
        {
          name: 'title',
          placeholder: 'Titre',
          value : this.specterData.name
        },
      ],
      buttons: [
        {
          text: 'Annuler',
          handler: () => {
          }
        },
        {
          text: 'Sauvegarder',
          handler: (data) => {

            if(data.title!=null && data.title!=""){
              var csv: any = '';
    
              for (let index = 0; index < this.nbElements; index++) {
                csv += index + ";" + this.dataReceived[index] + ";\r\n";
              }
              var fileName: any = data.title + ".csv"
              this.file.writeFile(this.file.externalRootDirectory,fileName,csv).then( () => {
                  this.showToast("Graphe sauvegardé en csv (Répertoire root)",1000);
                }).catch(err => {
                  this.showToast("Erreur pendant la sauvegarde du graphe",1000);
                });
            }
          }
        }
      ]
    });
  
    alert.present();
  }

  showToast(msj,time) {
    const toast = this.toastCtrl.create({
      message: msj,
      duration: time
    });
    toast.present();
  }

}
