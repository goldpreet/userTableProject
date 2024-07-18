import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { UserService } from '../../Services/user.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

interface User {
  id: number;
  name: string;
  status: string;
}

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxDatatableModule],
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.css']
})
export class UserTableComponent implements OnInit {
  rows: any[] = [];
  filteredRows: any[] = [];
  columns: any = [];


  initializeColumns(): void {
    this.columns = [
      { prop: 'role', name: 'Role' },
      { prop: 'name', name: 'Name' },
      { prop: 'gender', name: 'Gender' },
      { prop: 'phone', name: 'Phone' },
      { prop: 'age', name: 'Age' },
      { prop: 'id', name: 'id' },
      { prop: 'email', name: 'Email' },
      {
        prop: 'actions',
        name: 'Actions',
        sortable: false,
        canAutoResize: false,
        draggable: false,
        // cellTemplate: this.actionTemplate
      }
    ];
  }

  currentPage: number = 1;
  totalPages: number = 1;
  page = { limit: 4, offset: 0 };

  editedUser: User | null = null;
  user: any;
  userdata: any = [];
  userService = inject(UserService);

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadData();
    this.initializeColumns();
    this.user = this.userService.getLoggedInUser();
    console.log(this.user, "user");
  }

  loadData(): void {
    this.userService.getUserDetails().subscribe((data: any) => {
      this.rows = data.map((user: any) => ({
        role: user.role,
        name: user.name,
        gender: user.gender,
        phone: user.phone,
        age: user.age,
        email: user.email,
        id: user.guidId,
        password: user.password
      }));

      this.filteredRows = [...this.rows];
      this.initializePagination();
    });
  }

  getMaxEntries(): number {
    return Math.min((this.page.offset + 1) * this.page.limit, this.filteredRows.length);
  }

  updateFilter(event: any): void {
    const val = event.target.value.toLowerCase();
    this.filteredRows = this.rows.filter(row => {
      return row.name.toLowerCase().startsWith(val);

    });
    this.initializePagination();
  }


  onPage(event: any): void {
    this.page = event;
    this.currentPage = this.page.offset + 1;
  }

  onFirstPage(): void {
    this.page.offset = 0;
    this.updateTable();
  }

  onPreviousPage(): void {
    if (this.page.offset > 0) {
      this.page.offset--;
      this.updateTable();
    }
  }

  onNextPage(): void {
    if (!this.isLastPage()) {
      this.page.offset++;
      this.updateTable();
    }
  }

  onLastPage(): void {
    this.page.offset = this.totalPages - 1;
    this.updateTable();
  }

  onPageSelect(pageNum: number): void {
    this.page.offset = pageNum - 1;
    this.updateTable();
  }

  isLastPage(): boolean {
    return this.page.offset === this.totalPages - 1;
  }

  getPageNumbers(): number[] {
    const pageNumbers: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  }

  onItemsPerPageChange(event: Event): void {
    const newLimit = parseInt((event.target as HTMLSelectElement).value, 10);
    this.page.limit = newLimit;
    this.initializePagination();
  }

  updateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredRows.length / this.page.limit);
  }

  initializePagination(): void {
    this.updateTotalPages();
    this.page.offset = 0;
    this.currentPage = 1;
    this.updateTable();
  }

  updateTable(): void {
    this.currentPage = this.page.offset + 1;
    this.filteredRows = [...this.filteredRows];
  }

  editUser(user: User): void {
    this.editedUser = { ...user };
  }

  cancelEdit(): void {
    this.editedUser = null;
  }

  onRowClick(row: any) {
    this.router.navigate([`/display-details/${row.id}`]);
  }

  onRowActivate(event: any) {
    console.log(event, "event row");

    if (event.type === 'click') {
      this.onRowClick(event.row);
    }
  }

  deleteUser(row: any) {
    console.log(row, "row");

    this.userService.deleteUser(row.id).subscribe((data) => {
      console.log(data);
      alert('user deletd')
      this.rows = this.rows.filter((rowOg) => rowOg.id !== row.id)
    })
  }


  saveUserChanges(): void {
    if (this.editedUser) {
      const index = this.user.findIndex((u: User) => u.id === this.editedUser!.id);
      if (index !== -1) {
        this.user[index] = { ...this.editedUser };
        console.log(`User ${this.editedUser.id} updated.`);
        this.editedUser = null;
      }
    }
  }

  // deleteUser(row: any) {
  //   console.log(row,"row");

  //   this.userService.deleteUser(row.id).subscribe(() => {
  //     this.filteredRows = this.filteredRows.filter(user => user.id !== row.id);
  //   });
  // }

  addData(): void {
    this.router.navigateByUrl("/create-form");
  }

  logout(): void {
    this.router.navigate(['/log-in']);
  }
}
