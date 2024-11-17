import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar.component";
import { SharingDataService } from '../../services/sharing-data.service';

@Component({
  selector: 'app-user-app',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './user-app.component.html',
  styleUrls: ['./user-app.component.css']
})
export class UserAppComponent implements OnInit {
  users: User[] = [];

  constructor(
    private service: UserService,
    private sharingData: SharingDataService,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.service.findAll().subscribe(users => this.users = users);
    this.addUser();
    this.onRemove();
    this.findUserById();
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
              this.router.navigate(['/users'], { state: this.users });
            },
            error: (e) => {
              console.log(e.error);
            }
          },
        );
      }
      else {
        this.service.create(user).subscribe(
          {
            next: (userNew) => {
              this.users = [...this.users, { ...userNew }];
              this.router.navigate(['/users'], { state: this.users });
            },
            error: (e) => {
              console.log(e.error);
            }
          }
        );
      }
      Swal.fire({
        title: "Good job!",
        text: "You clicked the button!",
        icon: "success"
      });
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
                this.router.navigate(['/users'], { state: this.users });
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
