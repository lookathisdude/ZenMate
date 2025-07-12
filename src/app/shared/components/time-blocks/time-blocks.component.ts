import { Component } from '@angular/core';
import { GraphQLService } from '../../../core/services/graphql.service';

@Component({
  selector: 'app-time-blocks',
  imports: [],
  templateUrl: './time-blocks.component.html',
  styleUrl: './time-blocks.component.scss',
})
export class TimeBlocksComponent implements OnInit {
  timeBlocks: { id: string; name: string; position: number }[] = [];

  constructor(private gqlService: GraphQLService) {}

  ngOnInit() {
    this.gqlService.getTimeBlocks().subscribe((res) => {
      this.timeBlocks = res.data.timeBlocks;
    });
  }
}
