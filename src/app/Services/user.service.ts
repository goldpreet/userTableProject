import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  httpClient = inject(HttpClient);
  cookieService = inject(CookieService);

  constructor() {}

  private createAuthorizationHeader(): HttpHeaders {
    const token = this.cookieService.get('authToken');
    let headers = new HttpHeaders({'Content-Type': 'application/json'});
    if (token) {
      headers = headers.append('Authorization', token);
    }
    return headers;
    console.log(token);
  }
  
  uploadImage(formData: FormData): Observable<any> {
    console.log('Uploading image...', formData.get('image'));
    return of({ success: true, message: 'Image uploaded successfully!' });
};

addUserDetails(payload: FormData): Observable<any> {
  const headers = new HttpHeaders({
    // 'Authorization': `Bearer ${this.getToken()}`,  // Assuming you have a method to get the token
    // Note: Don't set Content-Type header when sending FormData
  });

  return this.httpClient.post(`https://localhost:7071/api/Employee`, payload, { 
    headers: headers,
    reportProgress: true,
    observe: 'events'
  });
}
  getUserDetails(): Observable<any[]> {
    const headers = this.createAuthorizationHeader();
    return this.httpClient.get<any[]>(`https://localhost:7071/api/Employee`, { headers });
  }

  updateDp(id:any, image:FormData){
    return this.httpClient.put<any[]>(`https://localhost:7071/api/Employee/${id}/photo`,image);
  }

  getUserById(param: any): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.httpClient.get<any>(`https://localhost:7071/api/Employee/${param}`, { headers });
  }

  updateUserData(payload: any): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.httpClient.put(`https://localhost:7071/api/Employee/${payload.guidId}`, payload, { headers });
  }

  login(payload: any): Observable<any> {
    return this.httpClient.post(`https://localhost:7071/api/employee/login`, payload);
  }
}
