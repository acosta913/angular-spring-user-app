import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private user: User[] = [
    {
      id: 1,
      name: 'acosta',
      lastname: 'paez',
      email: 'a@g.com',
      username: 'acosta01',
      password: '12345'
    }, {
      id: 2,
      name: 'perez',
      lastname: 'soza',
      email: 'soza@g.com',
      username: 'soza01',
      password: '1236'
    }
  ]
  constructor() { }

  findAll(): Observable<User[]> {
    return of(this.user);
  }
}
