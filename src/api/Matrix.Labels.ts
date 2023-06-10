/// <reference path="../../lib/core.d.ts" />
/// <reference path="../../lib/admin.d.ts" />
/// <reference path="./Matrix.d.ts" />
/// <reference path="./Matrix.REST.ts" />

namespace Matrix {
    export namespace Labels {
        /**
         * Get the label history for all items in a project
         */
        export function projectLabelHistory(resourceId: string): Promise<resourcesData> {
            return new Promise<resourcesData>((resolve, reject) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    Matrix.REST.projectGETRequest("/labelhistory")
                    .then((data: XRLabelHistory) => resolve({id:resourceId,source:data.entries}))
                    .catch((error) => reject(error));
            });
        }

        /**
         * Get needles by category and field id for all items in a project
         */
        export function getNeedlesByCategoryAndFiledId(resourceId: string, category: string, fieldId: Number): Promise<resourcesData> {
            return new Promise<resourcesData>((resolve, reject) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                Matrix.REST.projectGETRequest("/needle?search=mrql:category="+category+"&fieldsOut="+fieldId)
                    .then((data: XRTrimNeedle) => resolve({id:resourceId,source:data.needles}))
                    .catch((error) => reject(error));
            });
        }

        /**
         * Get needles by category and field id for all items in a project
         */
        export function getNeedlesBySearch(resourceId: string,searchParams: string): Promise<resourcesData> {
            return new Promise<resourcesData>((resolve, reject) => {
                Matrix.REST.projectGETRequest("/needle?search=mrql:"+searchParams)
                    .then((data: XRTrimNeedle) => resolve({id:resourceId,source:data.needles}))
                    .catch((error) => reject(error));
            });
        }
    }
}
