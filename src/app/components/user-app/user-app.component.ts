import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar.component";
import { SharingDataService } from '../../services/sharing-data.service';
import { AuthService } from '../../services/auth.service';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-user-app',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './user-app.component.html',
  styleUrls: ['./user-app.component.css']
})
export class UserAppComponent implements OnInit {
  users: User[] = [];
  paginator: any = {};
  user!: User;

  constructor(
    private store: Store<{ users: any }>,
    private service: UserService,
    private sharingData: SharingDataService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.store.select('users').subscribe(state => {
      this.users = state.users;
      this.paginator = state.paginator;
      this.user = state.user;
    })
  }

  ngOnInit(): void {
    //this.service.findAll().subscribe(users => this.users = users);  
    this.addUser();
    this.onRemove();
    this.findUserById();
    this.pageUsersEvent();
    this.handlerLogin();
  }

  handlerLogin() {
    this.sharingData.handlerLoginEventEmitter.subscribe(({ username, password }) => {
      console.log(username);
      this.authService.loginUser({ username, password }).subscribe({
        next: reponse => {
          const token = reponse.token;
          console.log('token', token);
          const payload = this.authService.getPayload(token);
          console.log('SPLIT', token.split("."));
          console.log('payload', payload);
          const user = { username };
          const login = {
            user,
            isAuth: true,
            isAdmin: payload.isAdmin
          };
          this.authService.token = token;
          this.authService.user = login;
          this.router.navigate(['/users/page/0']);
        },
        error: error => {
          if (error.status == 401) {
            console.log(error.error);
            Swal.fire(
              'Error en el login',
              error.error.message,
              'error'
            );
          } else {
            throw error;
          }
        }
      })
    })
  }

  pageUsersEvent() {
    this.sharingData.pageUsersEventEmitter.subscribe(pageable => {
      this.users = pageable.users;
      this.paginator = pageable.paginator;
    });
  }

  findUserById() {
    this.sharingData.findUserByIdEventEmitter.subscribe(id => {
      const user = this.users.find(user => user.id === id);
      this.sharingData.selectUserEventEmitter.emit(user);
    })
  }

  addUser() {
    this.sharingData.newUserEventEmitter.subscribe(user => {
      if (user.id > 0) {
        this.service.update(user).subscribe(
          {
            next: (userUpdate) => {
              this.users = this.users.map(u => (u.id === userUpdate.id) ? { ...userUpdate } : u);
              this.router.navigate(['/users'], {
                state: {
                  users: this.users,
                  paginator: this.paginator
                }
              });
              Swal.fire({
                title: "Good job Update!",
                text: "You clicked the button!",
                icon: "success"
              });
            },
            error: (e) => {
              if (e.status === 400) {
                console.log(e.error);
                this.sharingData.errorsUserFormEventEmitter.emit(e.error);
              }
            }
          },
        );
      }
      else {
        this.service.create(user).subscribe(
          {
            next: (userNew) => {
              this.users = [...this.users, { ...userNew }];
              this.router.navigate(['/users'], {
                state: {
                  users: this.users,
                  paginator: this.paginator
                }
              });
              Swal.fire({
                title: "Good job Create!",
                text: "You clicked the button!",
                icon: "success"
              });
            },
            error: (e) => {
              if (e.status === 400) {
                console.log(e.error);
                this.sharingData.errorsUserFormEventEmitter.emit(e.error);
              }
            }
          }
        );
      }
    });
  }

  onRemove(): void {
    this.sharingData.idUserEventEmitter.subscribe(id => {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
          this.service.delete(id).subscribe(
            () => {
              this.users = this.users.filter(user => user.id !== id);
              this.router.navigate(['/users/create'], { skipLocationChange: true }).then(() => {
                this.router.navigate(['/users'], {
                  state: {
                    users: this.users,
                    paginator: this.paginator
                  }
                });
              }
              );
              Swal.fire({
                title: "Deleted!",
                text: "Your file has been deleted.",
                icon: "success"
              });
            });
        }
      });
    });
  }
}
