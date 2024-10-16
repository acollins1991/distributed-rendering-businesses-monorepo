export default function createPage(path = "/", text = "U am a thing") {
    return {
        "frames": [
            {
                "component": {
                    "head": {
                        "type": "head"
                    },
                    "attributes": {
                        "id": "ivmo"
                    },
                    "components": [
                        {
                            "type": "text",
                            "attributes": {
                                "id": "iu6h"
                            },
                            "components": [
                                {
                                    "type": "textnode",
                                    "content": text
                                }
                            ]
                        }
                    ],
                    "docEl": {
                        "tagName": "html"
                    },
                    "type": "wrapper",
                    "stylable": [
                        "background",
                        "background-color",
                        "background-image",
                        "background-repeat",
                        "background-attachment",
                        "background-position",
                        "background-size"
                    ]
                },
                "id": "K2HyRmZXutfRbL2k"
            }
        ],
        "path": path,
        "id": crypto.randomUUID()
    }
}