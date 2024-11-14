import { Routes } from '@angular/router';
import { UserFormComponent } from './components/user-form/user-form.component';
import { UserViewComponent } from './components/user-view/user-view.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/users'
    },
    {
        path: 'users',
        component: UserViewComponent
    },
    {
        path: 'users/create',
        component: UserFormComponent
    },
    {
        path: 'users/edit/:id',
        component: UserFormComponent
    }
];
