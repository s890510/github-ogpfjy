import { Component } from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'QRCode';
  tabs = [];
  tabSelected = new FormControl(0);

  constructor() {
    this.newTab();
  }

  newTab() {
    this.tabs.push('QRCode_' + this.tabs.length);
    this.tabSelected.setValue(this.tabs.length - 1);
  }

  updateTabName(name: HTMLInputElement) {
    const tabItem = this.tabs.find(element => element == name.value);

    if (isNaN(tabItem)) {
      this.tabs[this.tabSelected.value] = name.value;
    } else {
      console.log('Reset value');
      name.value = this.tabs[this.tabSelected.value];
    }
  }
}
