import {Component, ElementRef, OnInit} from '@angular/core';
import {Product} from "../../../../model/Product";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {NumericValueType, RxFormBuilder, RxwebValidators} from "@rxweb/reactive-form-validators";

@Component({
    selector: 'app-product-price',
    templateUrl: './product-price.component.html',
    styleUrls: ['./product-price.component.scss']
})
export class ProductPriceComponent implements OnInit {

    productFg: FormGroup;

    availableDropdown: any[];

    constructor(private productModel: Product, private router: Router, private rxFormBuilder: RxFormBuilder,
                private el: ElementRef) {
    }

    ngOnInit(): void {
        this.initForm();

        this.availableDropdown = [
            {label: 'AVAILABLE', value: true},
            {label: 'NOT AVAILABLE', value: false},
        ];
    }

    initForm() {
        // form add or edit product
        this.productFg = this.rxFormBuilder.group({
            unitPrice: ['',
                [
                    RxwebValidators.required(),
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber, allowDecimal: false
                    }),
                    RxwebValidators.greaterThan({fieldName: 'discountedPrice'})
                ],
            ],
            discount: ['', [RxwebValidators.required()]],
            discountPercent: ['', []],
            sliderPercent: ['', []],
            discountedPrice: ['',
                [
                    RxwebValidators.required(),
                    RxwebValidators.lessThan({fieldName: 'unitPrice'})
                ]
            ],
        });

        // this.productFg.patchValue(this.productModel.productInformation.priceInformation);

        //for testing
        this.productFg.patchValue({
            unitPrice: 45000,
            discount: false,
            // discountPercent: 50,
            // discountedPrice: 12500,
        })

        // to disable or enable on init based discount status
        if (this.productFg.value.discount) {
            this.enableDiscountControls();
        } else {
            this.disableDiscountControls();
        }

    }

    inputUnitPrice(event) {
        if (this.productFg.value.discount) {
            let unitPrice = event.value;
            let discountPercent = this.productFg.get('discountPercent').value;
            let discountedPrice = unitPrice * discountPercent / 100;

            this.productFg.get('discountedPrice').setValue(unitPrice - discountedPrice);
        }
    }

    inputDiscountValue(event) {

        if (event.value > 100) {
            this.productFg.get('sliderPercent').setValue(100);
            this.productFg.get('discountedPrice').setValue(0);
        } else {
            this.productFg.get('sliderPercent').setValue(event.value);
            this.productFg.get('discountPercent').setValue(event.value);

            let unitPrice = this.productFg.get('unitPrice').value;
            let discountValue = unitPrice * event.value / 100;
            let discountedPrice = unitPrice - discountValue;

            this.productFg.get('discountedPrice').setValue(discountedPrice);
        }

    }

    inputDiscountedPrice(event) {
        if (this.productFg.get('unitPrice').value != 0) {
            let unitPrice = this.productFg.get('unitPrice').value;

            if (unitPrice) {
                let discountedPrice = event.value;
                let discountPercent = 100 * discountedPrice / unitPrice;

                this.productFg.get('discountPercent').setValue(discountPercent);
                this.productFg.get('sliderPercent').setValue(discountPercent);
            }
        }
    }

    onChangeDiscountStatus(event) {

        if (event.value == false) {
            this.disableDiscountControls();
        } else {
            this.enableDiscountControls();
        }

    }

    enableDiscountControls() {
        this.productFg.controls['discountedPrice'].enable();
        this.productFg.controls['discountPercent'].enable();
        this.productFg.controls['sliderPercent'].enable();
    }

    disableDiscountControls() {
        this.productFg.get('discountedPrice').setValue(0);
        this.productFg.get('sliderPercent').setValue(0);
        this.productFg.get('discountPercent').setValue(0);

        this.productFg.controls['discountedPrice'].disable();
        this.productFg.controls['discountPercent'].disable();
        this.productFg.controls['sliderPercent'].disable();
    }

    nextPage() {

        if (this.productFg.valid) {
            if (this.productFg.value.discountedPrice === 0 || this.productFg.value.discountPercent === 0) {
                this.productFg.value.discount = false;
            }
            this.productModel.productInformation.priceInformation = this.productFg.value;
            this.router.navigate(['pages/product/add/image']).then();
        } else {
            this.productFg.markAllAsTouched();
            this.validateFormFields(this.productFg);
        }

    }

    prevPage() {
        this.productModel.productInformation.priceInformation = this.productFg.value;
        this.router.navigate(['pages/product/add/detail']).then();
    }

    public validateFormFields(formGroup: FormGroup) {

        for (const key of Object.keys(formGroup.controls)) {

            if (formGroup.controls[key].invalid) {
                // option 1
                const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');
                if (invalidControl) {
                    invalidControl.focus();
                }
                break;
            }
        }
    }

}
