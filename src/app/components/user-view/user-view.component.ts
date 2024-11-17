import { Component, EventEmitter, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { SharingDataService } from '../../services/sharing-data.service';

@Component({
  selector: 'app-user-view',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './user-view.component.html'
})
export class UserViewComponent implements OnInit {
  title: string = 'Listado de usuarios';
  users: User[] = [];


  constructor(
    private router: Router,
    private userService: UserService,
    private sharingData: SharingDataService
  ) {
    if (this.router.getCurrentNavigation()?.extras.state) {
      this.users = this.router.getCurrentNavigation()?.extras.state!['users'];
    }
  }

  ngOnInit(): void {
    if (this.users === undefined || this.users === null || this.users.length === 0) {
      this.userService.findAll().subscribe(users => this.users = users);
    }

  }

  onRemoveUser(id: number): void {
    this.sharingData.idUserEventEmitter.emit(id);
  }

  onEditUserSelected(user: User): void {
    this.router.navigate(['/users/edit', user.id]);
  }
}
