import {Component, OnInit, ViewChild} from '@angular/core';
import {User} from "../../model/User";
import {Product} from "../../model/Product";
import {LazyLoadEvent, MenuItem, MessageService} from "primeng/api";
import {HttpParams} from "@angular/common/http";
import {ProductService} from "../../service/product.service";
import {environment} from "../../../environments/environment";
import {debounceTime, distinctUntilChanged, Observable, Subject, Subscription} from "rxjs";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {FormGroupExtension, NumericValueType, RxFormBuilder, RxwebValidators} from "@rxweb/reactive-form-validators";
import {ProductCategory} from "../../model/ProductCategory";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {

    subscription: Subscription;

    //for steps
    items: MenuItem[];

    selectedProducts: Product[];

    dataTblProducts: Product[];

    showAddOrEditProductDialog: boolean = false;

    cols: any[];

    categoryDropdown: any[] = [];

    statusDropdown: any[];

    availableDropdown: any[];

    tblProductLoading: boolean = false;

    editMode: boolean = false;

    totalTblProduct: number = 0;

    params = new HttpParams();

    @ViewChild('dt') inputSearch;

    searchFormGroup: FormGroup;

    productFg: FormGroup;

    apiBaseUrl = environment.apiBaseUrl;
    projectName = environment.project;

    constructor(
        private productService: ProductService,
        public productModel: Product,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private messageService: MessageService,
        private fb: FormBuilder,
        private rxFormBuilder: RxFormBuilder) {
    }

    ngOnInit(): void {
        this.initForm();

        this.availableDropdown = [
            {label: 'AVAILABLE', value: true},
            {label: 'NOT AVAILABLE', value: false},
        ];


        this.subscription = this.productModel.addOrEditComplete$.subscribe((productInformation) => {
            this.messageService.add({
                severity: 'success',
                summary: 'Order submitted',
                detail: 'Good Job'
            });
        });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    initForm() {
        //form search
        this.searchFormGroup = this.fb.group({
            searchInput: new FormControl()
        });

        // init search input debounce
        this.searchFormGroup.get('searchInput')
            .valueChanges
            .pipe(debounceTime(1000))
            .subscribe(dataValue => {
                this.inputSearch.filterGlobal(dataValue, 'contains')
            });

        // form add or edit product
        this.productFg = this.rxFormBuilder.group({
            id: [''],
            name: ['',
                [
                    RxwebValidators.required(),
                    RxwebValidators.minLength({value: 3}),
                    RxwebValidators.maxLength({value: 10})
                ]
            ],
            active: ['', [RxwebValidators.required()]],
            category: this.rxFormBuilder.group({
                id: ['', [RxwebValidators.required()]]
            }),
            description: ['',
                [
                    RxwebValidators.required(),
                    RxwebValidators.minLength({value: 20}),
                    RxwebValidators.maxLength({value: 100})
                ]
            ],
            totalCalories: ['',
                [
                    RxwebValidators.required(),
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: false
                    }),
                    RxwebValidators.maxNumber({value: 10000})
                ]
            ],
            discount: ['', [RxwebValidators.required()]],
            unitPrice: ['',
                [
                    RxwebValidators.required(),
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber, allowDecimal: false
                    }),
                    RxwebValidators.maxNumber({value: 1000000}),
                    RxwebValidators.minNumber({value: 1}),
                    RxwebValidators.greaterThan({fieldName: 'discountedPrice'})
                ],
            ],
            discountedPrice: ['',
                [
                    RxwebValidators.required(),
                    RxwebValidators.lessThan({fieldName: 'unitPrice'})
                ]
            ],
            images: this.rxFormBuilder.array([{
                initialValue: [],
            }])
        });

    }

    isChildComponentActive(): boolean {
        if (this.router.url.includes("/crud") || this.router.url.includes("/price") ) {
            return false;
        } else {
            return true;
        }
        // return this.router.url === '/';
    }

    // setSelectedDropdownStatus(status: boolean, badge: boolean): string {
    //     if (badge) {
    //         if (status === true) {
    //             return 'item-badge status-true';
    //         } else {
    //             return 'item-badge status-false';
    //         }
    //     } else {
    //         if (status === true) {
    //             return 'Active';
    //         } else {
    //             return 'Inactive';
    //         }
    //     }
    // }

    loadProducts(event: LazyLoadEvent) {

        this.tblProductLoading = true;

        let params = new HttpParams();
        params = params.append("page", event.first / event.rows);

        if (event.globalFilter) {
            params = params.append("searchKeyword", event.globalFilter);
        }

        if (event.sortField) {
            params = params.append("sortedFieldName", event.sortField);
        }

        params = params.append("order", event.sortOrder);
        params = params.append("size", event.rows);

        setTimeout(() => {
            this.productService.loadAllProducts(params).subscribe({
                next: (data: object) => {
                    this.dataTblProducts = data['data']['content'];
                    this.totalTblProduct = data['data']['totalElements'];
                    this.tblProductLoading = false;
                },
            });
        }, 1000);

    }

    openAddOrEditProductDialog(editMode?: boolean, product?: Product) {
        if (editMode) {

        } else {
            // this.productFg.reset();
            // this.productFg.markAsPristine();
            // this.productFg.markAsUntouched();
        }
        this.router.navigate(['pages/product/crud']);
        // this.showAddOrEditProductDialog = true;
    }

    submit() {
        console.log(this.productFg.value);
        this.productFg.markAllAsTouched();
    }

//   ON ACTION METHOD

    onDeleteSelectedProducts() {

    }

}
