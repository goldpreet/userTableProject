import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../Services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent {
  userDetails: any = {};
  isEditMode: boolean = false;
  uploadedImage: string | null = null;

  showQualificationInputs: boolean = false;
  newQualification: any = {
    qualificationName: '',
    experience: null,
    institution: ''
  };

  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFile: File | null = null;
  userImage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private http: HttpClient
  ) { }


  user: any;
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const guidId = params.get('id');
      if (guidId) {
        this.userService.getUserById(guidId).subscribe((data: any) => {
          this.userDetails = data;
          this.userImage = this.userDetails.imagePath;
        });
      }
    });
    this.user = this.userService.getLoggedInUser();
    console.log(this.user, "user");
  }





  toggleAddQualification() {
    if(this.user.role!=="Administrator"){
      alert("Employee is not Admin");
      return;
    }
    this.showQualificationInputs = true;
  }

  updateQualification() {
    if (this.newQualification.qualificationName &&
      this.newQualification.experience !== null &&
      this.newQualification.institution) {

      if (!this.userDetails.qualifications) {
        this.userDetails.qualifications = [];
      }

      const newQualificationEntry = { ...this.newQualification };
      this.userDetails.qualifications.push(newQualificationEntry);

      const payload = { ...this.userDetails };

      this.userService.updateUserData(payload).subscribe(() => {
        console.log("Updated successfully");
      });

      this.newQualification = {
        qualificationName: '',
        experience: null,
        institution: ''
      };

      this.showQualificationInputs = false;
    } else {
      alert('Please fill all fields');
    }
  }

  toggleEditMode() {
    if(this.user.role !== "Administrator"){
      alert( "Employee  is a User")
      return ;
    }
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      const payload = { ...this.userDetails };
      this.userService.updateUserData(payload).subscribe(() => {
        console.log("User details updated successfully");
      });
    }
  }

  cancelAddQualification() {
    this.newQualification = {
      qualificationName: '',
      experience: null,
      institution: ''
    };
    this.showQualificationInputs = false;
  }

  editImage() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;

    if (this.selectedFile) {
      this.uploadImage();
    }
  }

  uploadImage() {
    if (this.selectedFile && this.userDetails.guidId) {
      const formData = new FormData();
      formData.append('imageFile', this.selectedFile, this.selectedFile.name);

      this.userService.updateDp(this.userDetails.guidId, formData).subscribe({
        next: (response: any) => {
          console.log('Image updated successfully', response);
          this.userDetails.imageUrl = response.imageUrl;
          this.userImage = response.imageUrl;
        },
        error: (error) => {
          console.error('Error updating image', error);
        },
        complete: () => {
          console.log('Image update operation completed');
        }
      });
    }
  }
}
