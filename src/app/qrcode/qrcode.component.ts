import {Component, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {FormControl} from '@angular/forms';
import {isNumeric} from 'rxjs/internal-compatibility';
import crc16ccitt from 'crc/crc16ccitt';

export interface QRCodeElement {
  id: number;
  label: number;
  data: string;
  description: string;
}

@Component({
  selector: 'app-qrcode',
  templateUrl: './qrcode.component.html',
  styleUrls: ['./qrcode.component.css']
})

export class QRCodeComponent implements OnInit {
  displayedColumns: string[] = ['id', 'label', 'data', 'description', 'delete'];
  elementData: QRCodeElement[] = [];
  dataSource = new MatTableDataSource(this.elementData);

  dataTag: any[] = [];
  dataTag62: any[] = [];
  dataTag64: any[] = [];

  formDataId: FormControl;
  formDataLabel: FormControl;
  formDataData: FormControl;

  outputData = '';

  tag: number[] = [];

  constructor() {
    this.resetFormData();
  }

  ngOnInit(): void {
  }

  private resetFormData() {
    this.formDataId = new FormControl('');
    this.formDataLabel = new FormControl('');
    this.formDataData = new FormControl('');
  }

  // checkValue()

  addTag() {
    const data: QRCodeElement = {} as any;

    if (isNumeric(this.formDataId.value) && this.formDataId.value >= 0 && this.formDataId.value < 100) {
      data.id = Number(this.formDataId.value);
    }

    if (isNumeric(this.formDataLabel.value) &&
        this.formDataId.value >= 0 && this.formDataId.value < 100 && (data.id === 62 || data.id === 64)) {
      data.label = Number(this.formDataLabel.value);
    }

    if (this.formDataData.value.length > 0) {
      data.data = this.formDataData.value;
    }

    let checkIndex = data.id;
    if (data.id === 62 || data.id === 64) {
      if (isNaN(data.label)) {
        this.resetFormData();
        return;
      }

      checkIndex = Number(String(data.id) + String(data.label));

      if (!isNaN(this.dataTag[checkIndex])) {
        this.resetFormData();
        return;
      }
    } else if (!isNaN(this.dataTag[checkIndex])) {
      this.resetFormData();
      return;
    }

    this.dataTag[checkIndex] = data.data;
    this.elementData.push(data);
    this.dataSource = new MatTableDataSource(this.elementData);

    console.log(this.dataTag);

    this.dataSource.data.sort((a: QRCodeElement, b: QRCodeElement) => {
      if (a.id < b.id) {
        return -1;
      } else if (a.id > b.id) {
        return 1;
      } else {
        if (!isNaN(a.label) && !isNaN(b.label)) {
          if (a.label < b.label) {
            return -1;
          } else if (a.label > b.label) {
            return 1;
          }
        }
        return 0;
      }
    });

    this.resetFormData();
    this.updateCodeData();
  }


  updateCodeData() {
    let str = '';


    for (const data of this.elementData) {
      switch (data.id) {
        case 62:
        case 64:
          break;
        default:
          str += this.prefixInteger(data.id, 2) + this.prefixInteger(data.data.length, 2) + data.data;
      }
    }

    str += '6304';
    str += crc16ccitt(str).toString(16).toUpperCase();

    this.outputData = str;
  }

  setNumberPrefix(num, length): string {
    return isNaN(num) ? '--' : this.prefixInteger(num, length);
  }

  prefixInteger(num, length) {
    return (Array(length).join('0') + num).slice(-length);
  }

  updateData(value: HTMLInputElement) {

    const elementResult = this.elementData.find(dataElement =>
      dataElement.id === Number(value.id) && dataElement.label === Number(value.labels));

    elementResult.data = value.value;

    // this.elementData.push(data);
    this.dataSource = new MatTableDataSource(this.elementData);

    this.updateCodeData();
  }

  getIndexId(id: number, label: number): string {
    return (id === 62 || id === 64) ? String(id) + String(label) : String(id);
  }
}
