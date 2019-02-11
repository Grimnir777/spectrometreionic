import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';


const ALL_SPECTERS_DATA_KEY = 'allSpecters';
const CALIB_VALUES_DATA_KEY = 'calibValues';

@Injectable()
export class SaverProvider {
  constructor(public storage : Storage) {}

  //Get all specters : if not created create it
  public getAllSpecters() : Observable<any>{
    return new Observable<any>(obs => {
      this.storage.get(ALL_SPECTERS_DATA_KEY).then(data =>{
        if(data)
        {
          obs.next(JSON.parse(data));
          obs.complete();
        }
        else
        {
          console.log("new lists params created");
          let allSpecters = [];
          this.storage.set(ALL_SPECTERS_DATA_KEY,JSON.stringify(allSpecters));   
          obs.next(allSpecters);
          obs.complete();
        }
      });
    });
  }

  //Get Specter by id
  public getSpecterById(index:number): Observable<any>{
    return new Observable<any>(obs => {
      this.storage.get(ALL_SPECTERS_DATA_KEY).then(data =>{
        if(data)
        {
          var allSpecters = JSON.parse(data);
          obs.next(allSpecters[index]);
          obs.complete();
        }
        else
        {
          console.log("error");
          obs.complete();
        }
      });
    });
  }

  //Add specter
  public addSpecter(specter)
  {
    this.storage.get(ALL_SPECTERS_DATA_KEY).then(data =>{
      if(data)
      {
        var allSpecters = JSON.parse(data);
        allSpecters.push(specter);
        this.storage.set(ALL_SPECTERS_DATA_KEY,JSON.stringify(allSpecters));
      }
      else
      {
        console.log("error");
      }
    });
  }

  //Remove specter
  public removeSpecter(index : number){
    this.storage.get(ALL_SPECTERS_DATA_KEY).then(data =>{
      if(data)
      {
        var allSpecters = JSON.parse(data)
        console.log('removed list')
        console.log(allSpecters[index])
        allSpecters[index] = null;
        allSpecters.splice(index,1);
        console.log(allSpecters);
        this.storage.set(ALL_SPECTERS_DATA_KEY,JSON.stringify(allSpecters));
      }
      else
      {
        console.log("error list not created");
      }
    });

  }

  public getCalibValues(){
    return new Observable<any>(obs => {
      this.storage.get(CALIB_VALUES_DATA_KEY).then(data =>{
        if(data)
        {
          var calibValues = JSON.parse(data);
          obs.next(calibValues);
          obs.complete();
        }
        else
        {
          console.log("error");
          obs.complete();
        }
      });
    });
  }
  public setCalibValues(calibValues : any){
    this.storage.set(CALIB_VALUES_DATA_KEY,JSON.stringify(calibValues));
  }

}
