import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController, LoadingController  } from 'ionic-angular';
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
  

  @ViewChild('lineCanvas2') lineCanvas2;


  errorMsg : string = "Aucune erreur";
  isConnected : boolean = false;

  isSaved : boolean;
  isNewAcq : boolean;
  pageTitle : string;

  lineChart: any;
  lineChart2: any;

  dataNormalized : any;

  dataReceived : any;
  specterData: any;

  colorSpecterWidth : number;
  seuil : number = 20;

  indexCurrentR : number = 0;

  constructor(
    public navCtrl: NavController,
    private toastCtrl : ToastController,
    public navParams: NavParams, 
    public saver: SaverProvider,
    private alertCtrl: AlertController,
    private file: File,
    public loadingCtrl: LoadingController) 
  {
  }


  ionViewDidEnter() {
    this.initGraph();


    this.specterData = this.navParams.get('sp');
    if(this.specterData!=null)
    {
      this.dataReceived = this.specterData.listValue;
      console.log(this.specterData);
      this.fillGraph();
      this.fillGraphNormalized();
      this.pageTitle = this.specterData.name;
      this.isSaved = true;
      this.isNewAcq = false;
    }
    else{
      this.errorMsg = "Erreur au chargement du spectre";
    }
    console.log(this.isSaved);

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
            max: 1000,
            stepSize: 100
          }
        }]
      }
    }
  });



  this.lineChart2 = new Chart(this.lineCanvas2.nativeElement, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
          {
            label: 'Graphique normalisé',
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
            max: 1000,
            stepSize: 100
          }
        }]
      }
    }
  });
 }

 fillGraphNormalized(){
   this.saver.getCalibValues().subscribe(calibValues=>{
    var posRouge = calibValues['POS_ROUGE'];
    var posVert = calibValues['POS_VERT'];
    var pas = (posRouge - posVert)/ (100.2);
    var deltaInfVert = posVert - Math.round((532.8-430) / pas);
    var deltaSupVert = posVert + Math.round((750-532.8) / pas);
    var total = deltaSupVert - deltaInfVert;

    console.log(deltaInfVert);
    console.log(deltaSupVert);

    var newPath = "";
    this.colorSpecterWidth =  this.colorSpecter.nativeElement.getAttribute('viewBox').split(" ")[2];
    var pasColorSpecter = this.colorSpecterWidth / total;

    for (let index = deltaInfVert ; index < deltaSupVert ; index++) {
      var value = 10;
      if(index>=0 && index <= this.dataReceived.length){
        value = this.dataReceived[index];
      }

      if(this.dataReceived[index]>this.seuil)
      {
        newPath += "M" + (total - index)*pasColorSpecter + " 0 L" + (total-index)*pasColorSpecter + " 36 L" + ((total-index)+1)*pasColorSpecter +  " 36 L " + ((total-index)+1)*pasColorSpecter +" 0 Z";
      }
      
      let nm = (index - posVert)* pas + 532.8 ;
      this.lineChart2.data.datasets[0].data[total-index] = value;
      this.lineChart2.data.labels[index] = nm.toFixed(2);
      //nm = index * LONG_OND_VERT / PAS_VERT
      this.lineChart2.update();
    } 



    
    

    this.absorptionPath.nativeElement.setAttribute('d',newPath);

    //  POS_VERT:64
    //  POS_ROUGE : 220,
   })
 }

 fillGraph(){
  for (let index = 0; index < this.dataReceived.length; index++) {
    this.lineChart.data.datasets[0].data[index] = this.dataReceived[index];
    this.lineChart.data.labels[index] = index;
    //nm = index * LONG_OND_VERT / PAS_VERT
    this.lineChart.update();
  }
  //  this.fillColorSpecter();
 }

 fillColorSpecter(){
    this.colorSpecterWidth =  this.colorSpecter.nativeElement.getAttribute('viewBox').split(" ")[2];
    let pas = this.colorSpecterWidth / this.dataReceived.length;
    console.log(pas);
    let newPath = "";

    for (let i = 0; i < this.dataReceived.length; i++) {
      if(this.dataReceived[i]>this.seuil)
      {
        newPath += "M" + i*pas + " 0 L" + i*pas + " 36 L" + (i+1)*pas +  " 36 L " + (i+1)*pas +" 0 Z";
      }
    }

    this.absorptionPath.nativeElement.setAttribute('d',newPath);
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
    
              for (let index = 0; index < this.dataReceived.length; index++) {
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
