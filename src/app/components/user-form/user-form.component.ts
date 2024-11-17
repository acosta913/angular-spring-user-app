import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { User } from '../../models/user';
import { SharingDataService } from '../../services/sharing-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  user: User;
  errors: any = {};

  constructor(
    private sharingData: SharingDataService,
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    this.user = new User();
  }

  ngOnInit(): void {
    //this.sharingData.selectUserEventEmitter.subscribe(user => this.user = user);
    this.sharingData.errorsUserFormEventEmitter.subscribe(errors => this.errors = errors);
    this.route.paramMap.subscribe(params => {
      const id: number = +(params.get('id') || '0');
      if (id > 0) {
        //this.sharingData.findUserByIdEventEmitter.emit(id);
        this.userService.findById(id).subscribe(user => this.user = user);
      }
    });
  }

  onSubmit(userForm: NgForm): void {
    if (userForm.valid) {
      this.sharingData.newUserEventEmitter.emit(this.user);
    }
    userForm.reset();
    userForm.resetForm();
  }

  onClear(userForm: NgForm): void {
    this.user = new User();
    userForm.reset();
    userForm.resetForm();
  }
}
