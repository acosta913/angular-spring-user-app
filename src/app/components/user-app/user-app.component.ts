import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { UserViewComponent } from "../user-view/user-view.component";
import { UserFormComponent } from "../user-form/user-form.component";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-app',
  standalone: true,
  imports: [UserViewComponent, UserFormComponent],
  templateUrl: './user-app.component.html',
  styleUrls: ['./user-app.component.css']
})
export class UserAppComponent implements OnInit {
  title: string = 'Listado de usuarios';
  users: User[] = [];
  userSelected: User;
  isOpen: boolean = false;
  constructor(
    private service: UserService
  ) {
    this.userSelected = new User();
  }


  ngOnInit(): void {
    this.service.findAll().subscribe(users => this.users = users);
  }

  addUser(user: User) {
    if (user.id > 0) { this.users = this.users.map(u => (u.id === user.id) ? { ...user } : u) }
    else {
      this.users = [...this.users, { ...user, id: new Date().getTime() }];
    }
    Swal.fire({
      title: "Good job!",
      text: "You clicked the button!",
      icon: "success"
    });
    this.userSelected = new User();
    this.setIsOpen();
  }

  onRemove(id: number): void {
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
        this.users = this.users.filter(user => user.id !== id)
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success"
        });
      }
    });
  }

  onUserSelected(user: User): void {
    this.userSelected = { ...user }
    this.isOpen = true;
  }

  setIsOpen(): void {
    this.isOpen = !this.isOpen;
  }
}
