import { Component,ViewChild } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController, LoadingController  } from 'ionic-angular';
import { BluetoothSerial } from "@ionic-native/bluetooth-serial";
import { File } from "@ionic-native/file";
import { SaverProvider } from "../../providers/saver/saver";
import { Chart } from 'chart.js';


const NB_ACQUISITIONS = 400;

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
  colorSpecterPas : number;
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
    // this.colorSpecterWidth =  this.colorSpecter.nativeElement.getAttribute('viewBox').split(" ")[2];
    // this.colorSpecterPas = this.colorSpecterWidth / this.dataReceived.length;

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
            stepSize: 2
          }
        }]
      }
    }
  });
 }

 updateGraph(indexGraph){
  this.lineChart.data.datasets[0].data[indexGraph] = this.dataReceived[indexGraph];
  this.lineChart.data.labels[indexGraph] = indexGraph;
  this.lineChart.update();
  // this.updateColorSpecter(indexGraph);
 }
 updateColorSpecter(indexGraph){
  let newPath = this.absorptionPath.nativeElement.getAttribute('d');
  if(this.dataReceived[indexGraph]>this.seuil)
  {
    newPath += "M" + indexGraph*this.colorSpecterPas + " 0 L" + indexGraph*this.colorSpecterPas + " 36 L" + (indexGraph+1)*this.colorSpecterPas +  " 36 L " + (indexGraph+1)*this.colorSpecterPas +" 0 Z";
  }
  this.absorptionPath.nativeElement.setAttribute('d',newPath);

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
    this.dataReceived=[]
    for (let i = 0; i < NB_ACQUISITIONS; i++) {
      this.dataReceived.push(0.0);
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
        console.log(this.indexCurrentR);
        console.log(data);
        //this.dataReceived.push(parseFloat(data));
        this.dataReceived[this.indexCurrentR] = parseFloat(data);
        this.updateGraph(NB_ACQUISITIONS - this.indexCurrentR);
        this.indexCurrentR++;
        
        if(this.indexCurrentR >= NB_ACQUISITIONS)
        {
          loading.dismiss();
          console.log(this.dataReceived);
          console.log(this.lineChart);
          // this.fillGraph();
          this.fillColorSpecter();
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
    
              for (let index = 0; index < NB_ACQUISITIONS; index++) {
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
