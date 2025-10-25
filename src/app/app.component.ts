import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import * as moment from 'moment';
import { debounceTime } from 'rxjs/operators';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'dynamic-form';
  StaffForm: FormGroup;
  totalIndex: number = 0;
  newIndex: number = 0;
  setIndex: number = 0;
  showTable: boolean = false;
  isFormSubmitting: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.StaffForm = this.formBuilder.group({
      Rows: this.formBuilder.array([]),
    });

    this.getStaffDeduction();

    // Save the form
    this.StaffForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(() => {
      if (!this.isFormSubmitting) {
        this.onSubmitStaffDeduction();
      }
    });
  } 

  get rows(): FormArray {
    return this.StaffForm.get('Rows') as FormArray;
  }

  initStaffDeductionRowsWithData(rowData: any) {
    const rowDetails = this.formBuilder.group({
      Id: [rowData.Id],
      TenantStaffId: rowData.StaffId,
      TenantStaffName: rowData.StaffName,
      EffectiveDate: [moment(rowData.EffectiveDate).toISOString()], // Format as YYYY-MM-DD
      Status: [rowData.Status],
      Index: +this.setIndex
    });

    return rowDetails;
  }

  initStaffDeductionRows() {
    const row = this.formBuilder.group({
      Id: 0,
      TenantStaffId: 0,
      TenantStaffName: '',
      EffectiveDate: '',
      Status: 0,
      Index: +this.setIndex
    });

    return row;
  }

  addNewRow() {
    this.newIndex++;
    if (this.totalIndex != 0) {
      this.setIndex = this.totalIndex;
      this.setIndex++;

    } else {
      this.setIndex++;
    }
    
    this.showTable = true;
    this.rows.push(this.initStaffDeductionRows());
  }

  getStaffDeduction() {
    this.showTable = true;
    this.addNewRow();

    // START Get Staff Details Service
    // this.service.[getStaffDetails]().subscribe((response) => {
    //   if (response && response.result.length > 0) {
    //     this.showTable = true;
    //     this.totalIndex = response.result.length;
        
    //     for (const rowData of response.result) {
    //       this.setIndex++;
    //       this.formStaffDeductionArr.push(this.initStaffDeductionRowsWithData(rowData));
    //       // this.StaffForm.value.Rows.push(this.initStaffDeductionRowsWithData(rowData));
    //     }
    //   } else {
        
    //   }
    // });
    // END Get Staff Details Service
  }

  deleteRow(index: number, itemRow: FormGroup) {
    const model = itemRow.value;

    const dialogRef = this.dialog.open(ConfirmDialogComponent,
      {
        width: '450px',
        data: { title: 'Delete Confirmation', message: 'Would you like to delete this record?' }
      });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.rows.removeAt(index);
        this.setIndex -= 1;

        //-----------------------------------------------------------------------------------------------------------------//
        // Checking if Staff No row exist & has new Staff No row (no value), reset index to Staff No row existed           //
        //-----------------------------------------------------------------------------------------------------------------//
        if (this.newIndex > 0 && this.totalIndex > 0) {
          this.newIndex -= 1;
        }

        //---------------------------------------------------------//
        // Checking if Staff No row not exist, reset index to 0    //
        //---------------------------------------------------------//
        else if (this.newIndex > 0 && this.totalIndex == 0) {
          this.newIndex -= 1;
        }

        //----------------------------------------------------------------------------//
        // Checking if Staff No row existed, reset index to Staff No row existed only //
        //----------------------------------------------------------------------------//
        else {
          this.totalIndex -= 1;
        }

        // START Delete Service
        // this.service.[deleteStaff](model).subscribe(r => {
        //   if (r.ReturnCode == 200) {
        //     
        //   }
        // });
        // END Delete Service
      }
    });
  }

  isRowValid(row: FormGroup): boolean {
    return row.get('TenantStaffName').value
      && row.get('EffectiveDate').value
      && row.get('Status').value == 1;
  }

  async onSubmitStaffDeduction() {
    this.isFormSubmitting = true;
    const dataRow = this.StaffForm.value.Rows;

    for (let i = 0; i < this.totalIndex + this.newIndex; i++) {
      if (!dataRow || !dataRow[i]) {
        continue; // Skip if row[i] is undefined
      }

      // Adjust EffectiveDate for timezone offset
      if (dataRow[i].EffectiveDate) {
        const date = new Date(dataRow[i].EffectiveDate);
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        const correctedDate = new Date(date.getTime() - timezoneOffset);
        dataRow[i].EffectiveDate = correctedDate.toISOString().slice(0, 10); // Format as 'YYYY-MM-DD'
      }

      // Insert new record if Id is 0
      if (dataRow[i].Id === 0) {
        if (dataRow[i].TenantStaffName !== '' && dataRow[i].EffectiveDate !== '' && dataRow[i].Status !== 0) {
          this.totalIndex++;
          this.newIndex = 0;
  
          const { Index, ...Rows } = dataRow[i];
  
          // START Insert/Update Service 
          console.log('[Trigger Service Save]');
          // const result = await this.service.[insertStaff](Rows, Rows.Id).toPromise();
        
          // if (result.ReturnCode === 200) {
          //   if(Rows.Id === 0) {
          //     this.FlagStaffDeductionSaved = true;
          //     this.StaffForm.at(i).patchValue({ Id: result.Id }, { emitEvent: false });
          //   }
          // }
          // END Insert/Update Service
        }
      }
    }
    this.isFormSubmitting = false;
  }
}
