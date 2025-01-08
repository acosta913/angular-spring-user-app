import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './paginator.component.html'
})
export class PaginatorComponent {
  @Input() url: string = '';
  @Input() paginator: any = {};
}
