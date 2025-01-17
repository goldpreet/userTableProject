import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../Services/user.service';
import { Router } from '@angular/router';
import { take } from 'rxjs';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent {
  userForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      // id: ['', Validators.required],
      role: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      status: ['', Validators.required],
      gender: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      salary: ['', [Validators.required, Validators.min(0)]],
      password: ['', Validators.required],
      qualifications: this.fb.array([]),
    });
  }

  areInitialFieldsValid(): boolean {
    const initialFields = [
      'role',
      'name',
      'email',
      'status',
      'gender',
      'age',
      'phone',
      'salary',
      'password',
    ];
    return initialFields.every((field) => this.userForm.get(field)?.valid);
  }
  selectedFile: File | null = null;
  isQualificationVisible = false;

  toggleQualificationFields() {
    if (this.areInitialFieldsValid()) {
      this.isQualificationVisible = !this.isQualificationVisible;
      if (this.isQualificationVisible && this.qualifications.length === 0) {
        this.addQualification();
      }
    }
  }

  // show add qualification button only when the personal details are fully validated 
  // and completed  otherwise the button is disabled

  get qualifications(): FormArray {
    return this.userForm.get('qualifications') as FormArray;
  }

  getQualificationFormGroup(index: number): FormGroup {
    return this.qualifications.controls[index] as FormGroup;
  }

  addQualification() {
    const areAllQualificationsValid = this.qualifications.controls.every(
      (control) => control.valid
    );

    if (areAllQualificationsValid) {
      const qualificationGroup = this.fb.group({
        qualificationName: ['', Validators.required],
        experience: ['', [Validators.required, Validators.min(1)]],
        institution: ['', Validators.required],
      });
      this.qualifications.push(qualificationGroup);
    } else {
      console.log(
        'Please fill all the previous qualifications before adding a new one.'
      );
    }
  }
  // add more qualification only if the minimum all qualification row data is filled

  isAboveQualificationFilled() {
    const areAllQualificationsValid = this.qualifications.controls.every(
      (control) => control.valid
    );

    return areAllQualificationsValid;
  }

  // validating whether the data of qualification is filled 
  // then only one more row can be added and the add more qualification button gets to appear

  hasError(controlName: string, errorCode: string): boolean {
    const control = this.userForm.get(controlName);
    return control?.invalid && control?.errors?.[errorCode];
  }


  removeQualification(index: number) {
    this.qualifications.removeAt(index);
  }

  // remove the data entered in qualification

  isFormValid(): boolean {
    return this.areInitialFieldsValid() && this.qualifications.length > 0;
  }
  // submit button is validating that if  
  // data of qualification details filled then only submit button will appear
  route = inject(Router)
  userService = inject(UserService);
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }


  onSubmit() {
    if (this.userForm.invalid) {
      return;
    }

    console.log(this.selectedFile, "selected file");

    const formData = new FormData();

    // Append each form field individually
    Object.keys(this.userForm.controls).forEach(key => {
      if (key !== 'qualifications') {
        formData.append(key, this.userForm.get(key)?.value);
      }
    });

    // Append qualifications as an array of objects
    const qualifications = this.userForm.get('qualifications')?.value;
    qualifications.forEach((qual: any, index: number) => {
      formData.append(`qualifications[${index}].qualificationName`, qual.qualificationName);
      formData.append(`qualifications[${index}].experience`, qual.experience);
      formData.append(`qualifications[${index}].institution`, qual.institution);
    });

    // Append the file
    if (this.selectedFile) {
      formData.append('imageFile', this.selectedFile, this.selectedFile.name);
    }

    console.log('FormData entries:');
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    this.userService.addUserDetails(formData)
      .pipe(take(1))
      .subscribe({
        next: () => {
          alert('Data submitted');
          this.route.navigateByUrl('/user');
        },
        error: (error) => {
          console.error('Error submitting data:', error);
          alert('An error occurred while submitting data. Please try again.');
        }
      });
  }

}
