import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgxLuzmoVizItemComponent } from '@luzmo/ngx-embed';
import { filter, pairwise } from 'rxjs';
import { UserAvatarComponent } from '../../shared/components/user-avatar/user-avatar.component';
import { luzmoChartNameMapping, luzmoChartTheme } from '../../shared/constants/constants';
import { scrollToBottom } from '../../shared/functions/scroll.function';
import { getCurrentFormattedTime } from '../../shared/functions/timestamp.function';
import { AIChart } from '../../shared/models/aichart.model';
import { Authorization } from '../../shared/models/authorization.model';
import { LuzmoService } from '../../shared/services/luzmo.service';

type Subpage = {
  key: 'logistics' | 'hr' | 'sales';
  value: string;
  dataset_id: string;
  exampleQuestions: string[];
};

@Component({
  selector: 'app-embedded-chart-generator',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, MatIconModule, UserAvatarComponent, NgxLuzmoVizItemComponent],
  templateUrl: './embedded-ai-chart-generator.component.html',
  styleUrl: './embedded-ai-chart-generator.component.scss',
  providers: [LuzmoService]
})
export class EmbeddedAiChartGeneratorComponent implements OnInit {
  chatStartTimestamp = getCurrentFormattedTime();
  authorization?: Authorization;
  activeSubpage?: Subpage;
  subpages: Subpage[] = [
    { key: 'logistics', value: 'Logistics', dataset_id: '942d8c42-0885-4f5e-8c53-47fc899edf58', exampleQuestions: ['Show me the average passengers per boat', 'I want to see the amount of passengers per country', 'Can you visualize the load versus the load capacity?', `I'm interested in the passenger trend over time`] },
    { key: 'hr', value: 'Personnel', dataset_id: '877ca91e-dcb3-489e-a3cb-914879b642c2', exampleQuestions: ['I want to see the distribution of employee ages', 'Can you show me the performance score by department?', 'What is the average payrate per department?', `I'm interested in the reasons for employee termination`] },
    { key: 'sales', value: 'Sales', dataset_id: 'afab6c8e-41ad-4123-90fd-b96b170111f3', exampleQuestions: ['What is the total transaction amount by shop?', `I'm interested in the distribution of transaction types`, 'Can you show me the trend over time of items sold?', 'I want to see the shop revenue by month'] }
  ];
  status = { loading: true, generatingChart: false }
  messages: { type: 'user' | 'robot'; text: string; chart?: AIChart['generatedChart'] }[] = [];

  private messageHistory: any[] = [];

  @ViewChild('chatInput') chatInput!: ElementRef<HTMLInputElement>;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private route: ActivatedRoute,
    private luzmoService: LuzmoService
  ) { }

  ngOnInit(): void {
    // Generate a Luzmo embed token for all required datasets.
    this.luzmoService.retrieveAuthorization([], this.subpages.map(subpage => subpage.dataset_id))
      .subscribe(result => {
        this.authorization = result.token;
        this.status.loading = false;
      });

    this.route.queryParams.subscribe(params => this.activeSubpage = this.subpages.find(subpage => subpage.key === (params['dataset'] ?? 'logistics')));

    // When the subpage changes, clear the chat history.
    this.route.queryParamMap
      .pipe(
        pairwise(),
        filter(([previous, current]) => previous.get('dataset') !== current.get('dataset'))
      )
      .subscribe(() => {
        this.messages = [];
        this.messageHistory = [];
        this.status.generatingChart = false;
      });
  }

  sendMessage(text: string): void {
    if (this.status.loading || this.status.generatingChart) {
      return;
    }

    this.messages.push({ type: 'user', text });
    scrollToBottom(this.messagesContainer?.nativeElement);
    this.chatInput.nativeElement.value = '';
    this.status.generatingChart = true;

    this.luzmoService.retrieveAIChart(this.activeSubpage?.dataset_id ?? '', text, this.messageHistory)
      .subscribe({
        next: (result) => {
          console.log(result)
          result.generatedChart.options = {
            ...result.generatedChart.options,
            display: {
              ...result.generatedChart.options.display,
              title: false
            },
            theme: luzmoChartTheme
          };

          const chartType = result.generatedChart.type;
          const chartTitle = result.generatedChart.options.title.en.toLowerCase();

          this.messages.push({
            type: 'robot',
            text: `I generated a ${luzmoChartNameMapping[chartType] ?? 'chart'} that shows ${chartTitle}:`,
            chart: result.generatedChart
          });
          this.messageHistory = [
            { role: 'user', content: result.question },
            { role: 'function', name: result.functionCall, content: JSON.stringify(result.functionResponse) }
          ];

          this.status.generatingChart = false;
          scrollToBottom(this.messagesContainer.nativeElement);

          setTimeout(() => {
            this.chatInput.nativeElement.focus();
          }, 0);
        },
        error: () => {
          this.messages.push({
            type: 'robot',
            text: 'Oops, I couldn\'t create a chart that answers your question :-(. Can you try rephrasing your question?',
          });
          this.status.generatingChart = false;
          scrollToBottom(this.messagesContainer.nativeElement);
        }
      })
  }
}