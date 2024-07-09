import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../Services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

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

  selectedFile: File | null = null;
  userImage: string | null = null; // Holds the path to the uploaded image

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const guidId = params.get('id');
      this.userService.getUserById(guidId).subscribe((data: any) => {
        this.userDetails = data;
        // Assign existing user image path if available
        this.userImage = this.userDetails.imagePath; // Replace with your actual property name
      });
    });
  }

  toggleAddQualification() {
    this.showQualificationInputs = true;
  }

  updateQualification() {
    // Update qualification logic as per your existing implementation
  }

  toggleEditMode() {
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



  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadImage() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
  
      this.http.post<any>('http://localhost:3000/upload', formData).subscribe(
        response => {
          console.log('Image uploaded successfully:', response);
          const uploadedFileName = response.filename;
          this.copyImageToAssetsFolder(uploadedFileName);
        },
        (error: HttpErrorResponse) => {
          console.error('Error uploading image:', error);
          if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred.
            console.error('Client-side error:', error.error.message);
          } else {
            // The backend returned an unsuccessful response code.
            console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
          }
        }
      );
    } else {
      console.error('No file selected');
    }
  }
  copyImageToAssetsFolder(uploadedFileName: any) {
    throw new Error('Method not implemented.');
  }
}  
