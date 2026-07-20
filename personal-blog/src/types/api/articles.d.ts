declare namespace API {
    namespace Articles {
        interface getArticleResponse {
            records: any[];
            page: number;
            pageSize: number;
            total: number;
        }

        interface getArticleParams {
            page: number;
            pageSize: number;
        }

        interface createArticleParams {
            title: string;
            content: string;
        }

        interface updateArticleParams {
            title: string;
            content: string;
        }
    }
}