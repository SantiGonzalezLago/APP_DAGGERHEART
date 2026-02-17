import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonSplitPane, IonContent } from '@ionic/angular/standalone';
import { MenuComponent } from './components/menu/menu.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonSplitPane, IonContent, MenuComponent],
})
export class AppComponent {}
