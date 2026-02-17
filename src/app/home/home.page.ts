import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { menu } from 'ionicons/icons';
import { TranslatePipe } from '../pipes/translate.pipe';

addIcons({ menu });

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, TranslatePipe],
})
export class HomePage {
}
