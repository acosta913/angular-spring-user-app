import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  @Input() users: User[] = [];
  @Input() paginator: any = {};

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  get login() {
    return this.authService.user;
  }

  get admin() {
    return this.authService.isAdmin();
  }

  handlerLogOut() {
    this.authService.logOut();
    this.router.navigate(['/login']);
  }
}
