import { Label } from "@/commons/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/commons/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/commons/components/ui/select"

interface CommonFieldsProps {
    cardType: string;
    setCardType: (v: string) => void;
    embossType: string;
    setEmbossType: (v: string) => void;
    corporates: any[];
    selectedCorp: any;
    setSelectedCorp: (c: any) => void;
    products: any[];
    selectedProduct: any;
    setSelectedProduct: (p: any) => void;
    disabled?: boolean;
    fieldErrors?: Record<string, string>;
}

export function CommonFields({
    cardType,
    setCardType,
    embossType,
    setEmbossType,
    corporates,
    selectedCorp,
    setSelectedCorp,
    products,
    selectedProduct,
    setSelectedProduct,
    disabled = false,
    fieldErrors = {}
}: CommonFieldsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label>Corporate</Label>
                <Select value={selectedCorp?.id?.toString() || ""} disabled={true}>
                    <SelectTrigger className={fieldErrors.corporateCode ? "border-destructive" : ""}>
                        <SelectValue placeholder={selectedCorp?.name || "Select a corporate"} />
                    </SelectTrigger>
                    <SelectContent>
                        {corporates.map((corp) => (
                            <SelectItem key={corp.id} value={corp.id.toString()}>
                                {corp.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {fieldErrors.corporateCode && <p className="text-xs text-destructive">{fieldErrors.corporateCode}</p>}
            </div>
            <div className="space-y-2">
                <Label>Product</Label>
                <Select onValueChange={(value) => setSelectedProduct(products.find(p => p.id.toString() === value))}
                    defaultValue={selectedProduct?.id?.toString()} disabled={disabled || !selectedCorp}>
                    <SelectTrigger className={fieldErrors.productCode ? "border-destructive" : ""}><SelectValue placeholder="Select a product" /></SelectTrigger>
                    <SelectContent>{products.map((prod) => <SelectItem key={prod.id}
                        value={prod.id.toString()}>{prod.productName}</SelectItem>)}</SelectContent>
                </Select >
                {fieldErrors.productCode && <p className="text-xs text-destructive">{fieldErrors.productCode}</p>}
            </div >
            <div className="space-y-2">
                <Label>Card Type</Label>
                <RadioGroup name="cardType" value={cardType} onValueChange={setCardType} className="flex gap-4" disabled={disabled}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="VIRTUAL" id="virtual" />
                        <Label htmlFor="virtual">Virtual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="PHYSICAL" id="physical" />
                        <Label htmlFor="physical">Physical</Label>
                    </div>
                </RadioGroup>
            </div>
            <div className="space-y-2">
                <Label>Emboss Type</Label>
                <RadioGroup name="embossType" value={embossType} onValueChange={setEmbossType} className="flex gap-4" disabled={disabled}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="PERSONALIZED" id="perso" />
                        <Label htmlFor="perso">Perso</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NON_PERSONALIZED" id="non-perso" />
                        <Label htmlFor="non-perso">Non Perso</Label>
                    </div>
                </RadioGroup>
            </div>
        </div >
    )
}
