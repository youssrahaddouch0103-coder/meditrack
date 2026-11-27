import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { ServicesComponent } from '../../components/services/services.component';
import { WhyChooseUsComponent } from '../../components/why-choose-us/why-choose-us.component';
import { AboutComponent } from '../../components/about/about.component';
import { TeamComponent } from '../../components/team/team.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { AppointmentComponent } from '../../components/appointment/appointment.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    HeroComponent,
    ServicesComponent,
    WhyChooseUsComponent,
    AboutComponent,
    TeamComponent,
    TestimonialsComponent,
    AppointmentComponent,
    ContactComponent,
    FooterComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <main class="app-main">
      <app-hero></app-hero>
      <app-services></app-services>
      <app-why-choose-us></app-why-choose-us>
      <app-about></app-about>
      <app-team></app-team>
      <app-testimonials></app-testimonials>
      <app-appointment></app-appointment>
      <app-contact></app-contact>
    </main>
    <app-footer></app-footer>
  `
})
export class HomeComponent {}
