import { Component, EventEmitter, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { SharingDataService } from '../../services/sharing-data.service';
import { PaginatorComponent } from "../paginator/paginator.component";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-view',
  standalone: true,
  imports: [RouterModule, PaginatorComponent],
  templateUrl: './user-view.component.html'
})
export class UserViewComponent implements OnInit {
  title: string = 'Listado de usuarios';
  users: User[] = [];
  paginator: any = {};
  pageUrl: string = '/users/page'

  constructor(
    private router: Router,
    private userService: UserService,
    private sharingData: SharingDataService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    if (this.router.getCurrentNavigation()?.extras.state) {
      this.users = this.router.getCurrentNavigation()?.extras.state!['users'];
      this.paginator = this.router.getCurrentNavigation()?.extras.state!['paginator'];
    }
  }

  ngOnInit(): void {
    if (this.users === undefined || this.users === null || this.users.length === 0) {
      //this.userService.findAll().subscribe(users => this.users = users);
      this.route.paramMap.subscribe(params => {
        const page = +(params.get('page') || '0');
        this.userService.findAllPageable(page).subscribe(pageable => {
          this.users = pageable.content as User[];
          this.paginator = pageable;
          this.sharingData.pageUsersEventEmitter.emit({ users: this.users, paginator: this.paginator });
        });
      })
    }

  }

  onRemoveUser(id: number): void {
    this.sharingData.idUserEventEmitter.emit(id);
  }

  onEditUserSelected(user: User): void {
    this.router.navigate(['/users/edit', user.id]);
  }

  get admin() {
    return this.authService.isAdmin();
  }
}
