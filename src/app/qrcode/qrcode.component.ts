import {Component, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {FormControl} from '@angular/forms';
import {isNumeric} from 'rxjs/internal-compatibility';
import {crc16ccitt} from 'crc';
import {SHA1} from 'crypto-js';

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

    dataTag: string[] = [];
    dataTag62: QRCodeElement[] = [];
    dataTag64: QRCodeElement[] = [];

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

        const checkIndex = SHA1(String(data.id) + String(data.label)).toString();
        if (this.dataTag.indexOf(checkIndex) >= 0 || data.id === 63) {
            this.resetFormData();
            return;
        }

        if (data.id === 62 || data.id === 64) {
            if (isNaN(data.label)) {
                this.resetFormData();
                return;
            }
        }

        switch (data.id) {
            case 62:
                this.dataTag62.push(data);
                break;
            case 64:
                this.dataTag64.push(data);
                break;
            default:
                this.dataTag.push(checkIndex);
                break;
        }

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

    // checkValue()

    calcSpecialTag(tagId: number): string {
        let str = '';
        let data: QRCodeElement[];

        switch (tagId) {
            case 62:
                data = this.dataTag62;
                break;
            case 64:
                data = this.dataTag64;
                break;
            default:
                return null;
        }

        for (const d of data) {
            str += this.prefixInteger(d.label, 2) + this.prefixInteger(d.data.length, 2) + d.data;
        }

        str = this.prefixInteger(tagId, 2) + this.prefixInteger(str.length, 2) + str;

        return str;
    }

    updateCodeData() {
        let str = '';

        const alreadyLoad = [];

        for (const data of this.elementData) {
            switch (data.id) {
                case 62:
                case 64:
                    if (isNaN(alreadyLoad[data.id])) {
                        str += this.calcSpecialTag(data.id);
                        alreadyLoad[data.id] = true;
                    }
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
            SHA1(String(dataElement.id) + String(dataElement.label)).toString() === value.id);

        elementResult.data = value.value;

        this.dataSource = new MatTableDataSource(this.elementData);
        this.updateCodeData();
    }

    getIndexId(id: number, label: number): string {
        return SHA1(String(id) + String(label)).toString();
    }

    delTag(element: QRCodeElement) {
        const index = this.elementData.indexOf(element);

        if (index >= 0) {
            this.elementData.splice(index, 1);
        }

        this.dataSource = new MatTableDataSource(this.elementData);
        this.updateCodeData();
    }

    private resetFormData() {
        this.formDataId = new FormControl('');
        this.formDataLabel = new FormControl('');
        this.formDataData = new FormControl('');
    }
}
