import { Injectable } from '@angular/core';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Country, Region, SmallCountry } from '../interfaces/country.interface';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUrl: string = 'https://restcountries.com/v3.1' //  /region/europe?fields=cca3,name,borders

  private _region: Region[] = [Region.Africa, Region.Americas, Region.Asia, Region.Europe, Region.Oceania];

  constructor(private http: HttpClient) { }

  get regions(): Region[] {
    return [...this._region];
  }


  getCountryBYRegion(region: Region): Observable<SmallCountry[]> {
    if (!region) return of([]);
    const url = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`
    return this.http.get<Country[]>(url)
      .pipe(
        map(countries => countries.map(country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        }))),
        // tap(response => console.log({ response }))
      )
  }

  getCountryByAlphaCode(alphaCode: string): Observable<SmallCountry> {
    const url = `${this.baseUrl}/alpha/${alphaCode}?fields=cca3,name,borders`;
    return this.http.get<Country>(url)
      .pipe(
        map(country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? [],
        }))
      )
  }


  getCountryBorderByCodes(bordes: string[]): Observable<SmallCountry[]> {
    if (!bordes || bordes.length === 0) return of([]);

    const countriesrequest: Observable<SmallCountry>[] = [];
    bordes.forEach(code => {
      const request = this.getCountryByAlphaCode(code);
      countriesrequest.push(request);
    });

    return combineLatest(countriesrequest)
  }


}
