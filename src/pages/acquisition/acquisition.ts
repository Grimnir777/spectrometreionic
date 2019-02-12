import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController, LoadingController  } from 'ionic-angular';
import { BluetoothSerial } from "@ionic-native/bluetooth-serial";
import { File } from "@ionic-native/file";

import { Chart } from 'chart.js';

import { SaverProvider } from "../../providers/saver/saver";

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

  isSaved : boolean;
  isNewAcq : boolean;
  pageTitle : string;

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

  ionViewDidLoad() {
    this.initGraph();

    this.specterData = this.navParams.get('sp');
    if(this.specterData!=null)
    {
      this.dataReceived = this.specterData.listValue;
      console.log(this.specterData);
      this.fillGraph();
      this.pageTitle = this.specterData.name;
      this.isSaved = true;
      this.isNewAcq = false;
    }
    else{
      this.isNewAcq = true;      
      this.isSaved = false;
      this.pageTitle = "Nouvelle acquisition";
    }

    //console.log(this.colorSpecter.nativeElement.getAttribute('width'));
    //console.log(this.colorSpecter.nativeElement.getAttribute('height'));

    //this.absorptionPath.nativeElement.setAttribute('d',"M150 0 L150 36 L200 36 L 200 0 Z M250 0 L250 36 L350 36 L 350 0 Z");
 }

 initGraph(){
  this.lineChart = new Chart(this.lineCanvas.nativeElement, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
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
    this.lineChart.data.datasets[0].data[index] = this.dataReceived[index].valeur_lu;
    this.lineChart.data.labels[index] = this.dataReceived[index].longueur_onde_lu;
    this.lineChart.update();
  }
  //this.fillColorSpecter();
 }

 fillColorSpecter(){
    this.colorSpecterWidth =  this.colorSpecter.nativeElement.getAttribute('viewBox').split(" ")[2];
    let pas = this.colorSpecterWidth / this.dataReceived.length;
    console.log(pas);
    let newPath = "";

    for (let i = 0; i < this.dataReceived.length; i++) {
      if(this.dataReceived[i].valeur_lu>this.seuil)
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

  //simulation of data
  startAcquisition2(){

    this.dataReceived = [];
    //this.lineChart.data.datasets[0].data=[];
    //this.lineChart.data.labels=[];
    
    for (let index = 0; index < this.nbElements; index++) {
      let data = (Math.floor(Math.random() * Math.floor(100)) +(index-30));
      this.dataReceived.push(data);
      //this.lineChart.data.datasets[0].data.push(data);
      //this.lineChart.data.labels.push(index);
      this.lineChart.data.datasets[0].data[index] = data;
      this.lineChart.data.labels[index] = index;
      this.lineChart.update();
    }
    this.fillColorSpecter();

    //console.log(this.dataReceived);
  }


  startAcquisition(){
    var loading = this.loadingCtrl.create({
      spinner: 'crescent',
      content: 'Acquisition en cours ...'
    });

    loading.present();

    this.saver.getCalibValues().subscribe(result=> {

      var pos_moteur = result.pos_moteur;
      var longueur_onde = result.longueur_onde;
      var dataLigne = [];
      
      while(this.dataReceived == [])
      {
        this.bluetoothSerial.write("acq").then(success => {
          this.bluetoothSerial.readUntil('\n').then((data: any) => {
            this.bluetoothSerial.read().then((data:any) => {
            console.log(data);
            dataLigne = data.split(',');
            var pos_moteur_lu = dataLigne[0];
            var valeur_lu = dataLigne[1];

            console.log(this.dataReceived);
              this.dataReceived.push({
                  longueur_onde_lu : parseFloat(pos_moteur_lu) * longueur_onde / pos_moteur,
                  valeur_lu : parseFloat(valeur_lu) /4096*100
              })
            console.log(this.dataReceived);
    
            this.bluetoothSerial.clear();
            this.fillGraph();
            this.isSaved = false;
            loading.dismiss();
          })
          });
          this.showToast("Data received",1000);
        }, error => {
          this.showToast(error,1000)
        });
      }

    })

    
    
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
