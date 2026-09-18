export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      brands: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          status: string
          store_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          status?: string
          store_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          status?: string
          store_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
          status: string
          store_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          status?: string
          store_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          status?: string
          store_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          business_name: string
          created_at: string | null
          id: string
          invoice_prefix: string | null
          receipt_prefix: string | null
          tax_enabled: boolean | null
          tax_rate: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          business_name: string
          created_at?: string | null
          id?: string
          invoice_prefix?: string | null
          receipt_prefix?: string | null
          tax_enabled?: boolean | null
          tax_rate?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          business_name?: string
          created_at?: string | null
          id?: string
          invoice_prefix?: string | null
          receipt_prefix?: string | null
          tax_enabled?: boolean | null
          tax_rate?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          credit_limit: number | null
          customer_type: string
          email: string | null
          id: string
          name: string
          phone: string | null
          status: string
          store_id: string
          tax_number: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          credit_limit?: number | null
          customer_type?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: string
          store_id: string
          tax_number?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          credit_limit?: number | null
          customer_type?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: string
          store_id?: string
          tax_number?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          currency: string
          description: string
          expense_date: string
          id: string
          store_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at: string
          currency: string
          description: string
          expense_date: string
          id: string
          store_id: string
          tenant_id: string
          updated_at: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          currency?: string
          description?: string
          expense_date?: string
          id?: string
          store_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      goods_receipt_items: {
        Row: {
          created_at: string
          goods_receipt_id: string
          id: string
          line_total: number
          product_id: string
          purchase_order_item_id: string
          quantity_received: number
          tenant_id: string
          unit_cost: number
        }
        Insert: {
          created_at?: string
          goods_receipt_id: string
          id?: string
          line_total?: number
          product_id: string
          purchase_order_item_id: string
          quantity_received: number
          tenant_id: string
          unit_cost?: number
        }
        Update: {
          created_at?: string
          goods_receipt_id?: string
          id?: string
          line_total?: number
          product_id?: string
          purchase_order_item_id?: string
          quantity_received?: number
          tenant_id?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipt_items_goods_receipt_id_fkey"
            columns: ["goods_receipt_id"]
            isOneToOne: false
            referencedRelation: "goods_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_items_purchase_order_item_id_fkey"
            columns: ["purchase_order_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receipts: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          purchase_order_id: string
          received_by: string | null
          received_date: string
          store_id: string
          supplier_id: string
          tenant_id: string
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          purchase_order_id: string
          received_by?: string | null
          received_date?: string
          store_id: string
          supplier_id: string
          tenant_id: string
          warehouse_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          purchase_order_id?: string
          received_by?: string | null
          received_date?: string
          store_id?: string
          supplier_id?: string
          tenant_id?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipts_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          average_cost: number
          created_at: string
          id: string
          last_movement_at: string | null
          maximum_stock_level: number | null
          minimum_stock_level: number
          product_id: string
          quantity_on_hand: number
          quantity_reserved: number
          store_id: string
          tenant_id: string
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          average_cost?: number
          created_at?: string
          id?: string
          last_movement_at?: string | null
          maximum_stock_level?: number | null
          minimum_stock_level?: number
          product_id: string
          quantity_on_hand?: number
          quantity_reserved?: number
          store_id: string
          tenant_id: string
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          average_cost?: number
          created_at?: string
          id?: string
          last_movement_at?: string | null
          maximum_stock_level?: number | null
          minimum_stock_level?: number
          product_id?: string
          quantity_on_hand?: number
          quantity_reserved?: number
          store_id?: string
          tenant_id?: string
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          after_quantity: number
          before_quantity: number
          created_at: string
          id: string
          movement_type: string
          notes: string | null
          product_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          store_id: string | null
          tenant_id: string
          type: string
          unit_cost: number
          warehouse_id: string
        }
        Insert: {
          after_quantity?: number
          before_quantity?: number
          created_at?: string
          id?: string
          movement_type: string
          notes?: string | null
          product_id: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          store_id?: string | null
          tenant_id: string
          type?: string
          unit_cost?: number
          warehouse_id: string
        }
        Update: {
          after_quantity?: number
          before_quantity?: number
          created_at?: string
          id?: string
          movement_type?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          store_id?: string | null
          tenant_id?: string
          type?: string
          unit_cost?: number
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_academic_years: {
        Row: {
          code: string
          created_at: string
          curriculum_id: string
          ends_on: string
          id: string
          name: string
          organization_id: string
          starts_on: string
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          curriculum_id: string
          ends_on: string
          id?: string
          name: string
          organization_id: string
          starts_on: string
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          curriculum_id?: string
          ends_on?: string
          id?: string
          name?: string
          organization_id?: string
          starts_on?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_year_curriculum_fk"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "learning_curricula"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_year_org_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_assessment_questions: {
        Row: {
          assessment_id: string
          created_at: string
          id: string
          points: number
          question_version_id: string
          required: boolean
          sequence_no: number
        }
        Insert: {
          assessment_id: string
          created_at?: string
          id?: string
          points?: number
          question_version_id: string
          required?: boolean
          sequence_no: number
        }
        Update: {
          assessment_id?: string
          created_at?: string
          id?: string
          points?: number
          question_version_id?: string
          required?: boolean
          sequence_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_assessment_questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "learning_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_assessment_questions_question_version_id_fkey"
            columns: ["question_version_id"]
            isOneToOne: false
            referencedRelation: "learning_question_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_assessment_results: {
        Row: {
          attempt_id: string
          created_at: string
          evaluated_at: string
          id: string
          max_score: number | null
          organization_id: string | null
          passed: boolean | null
          percentage: number | null
          score: number | null
          student_user_id: string
          summary: Json
          updated_at: string
        }
        Insert: {
          attempt_id: string
          created_at?: string
          evaluated_at?: string
          id?: string
          max_score?: number | null
          organization_id?: string | null
          passed?: boolean | null
          percentage?: number | null
          score?: number | null
          student_user_id: string
          summary?: Json
          updated_at?: string
        }
        Update: {
          attempt_id?: string
          created_at?: string
          evaluated_at?: string
          id?: string
          max_score?: number | null
          organization_id?: string | null
          passed?: boolean | null
          percentage?: number | null
          score?: number | null
          student_user_id?: string
          summary?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_assessment_results_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: true
            referencedRelation: "learning_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_assessment_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_assessment_results_student_user_id_fkey"
            columns: ["student_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_assessments: {
        Row: {
          assessment_type: string
          code: string
          created_at: string
          created_by: string
          curriculum_id: string | null
          description: string | null
          grade_level_id: string | null
          id: string
          language_code: string
          organization_id: string | null
          published_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          assessment_type: string
          code: string
          created_at?: string
          created_by: string
          curriculum_id?: string | null
          description?: string | null
          grade_level_id?: string | null
          id?: string
          language_code?: string
          organization_id?: string | null
          published_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          assessment_type?: string
          code?: string
          created_at?: string
          created_by?: string
          curriculum_id?: string | null
          description?: string | null
          grade_level_id?: string | null
          id?: string
          language_code?: string
          organization_id?: string | null
          published_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_assessments_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "learning_curricula"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_assessments_grade_curriculum_fk"
            columns: ["curriculum_id", "grade_level_id"]
            isOneToOne: false
            referencedRelation: "learning_grade_levels"
            referencedColumns: ["curriculum_id", "id"]
          },
          {
            foreignKeyName: "learning_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_assessments_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_assessments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_attempt_answers: {
        Row: {
          answer: Json
          assessment_question_id: string
          attempt_id: string
          awarded_points: number | null
          created_at: string
          evaluated_at: string | null
          evaluation_status: string
          feedback: Json | null
          id: string
          is_correct: boolean | null
          updated_at: string
        }
        Insert: {
          answer?: Json
          assessment_question_id: string
          attempt_id: string
          awarded_points?: number | null
          created_at?: string
          evaluated_at?: string | null
          evaluation_status?: string
          feedback?: Json | null
          id?: string
          is_correct?: boolean | null
          updated_at?: string
        }
        Update: {
          answer?: Json
          assessment_question_id?: string
          attempt_id?: string
          awarded_points?: number | null
          created_at?: string
          evaluated_at?: string | null
          evaluation_status?: string
          feedback?: Json | null
          id?: string
          is_correct?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_attempt_answers_assessment_question_id_fkey"
            columns: ["assessment_question_id"]
            isOneToOne: false
            referencedRelation: "learning_assessment_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "learning_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_attempts: {
        Row: {
          assessment_id: string
          attempt_number: number
          created_at: string
          id: string
          max_score: number | null
          organization_id: string | null
          percentage: number | null
          previous_attempt_id: string | null
          score: number | null
          started_at: string
          status: string
          student_user_id: string
          submitted_at: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          assessment_id: string
          attempt_number: number
          created_at?: string
          id?: string
          max_score?: number | null
          organization_id?: string | null
          percentage?: number | null
          previous_attempt_id?: string | null
          score?: number | null
          started_at?: string
          status?: string
          student_user_id: string
          submitted_at?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          attempt_number?: number
          created_at?: string
          id?: string
          max_score?: number | null
          organization_id?: string | null
          percentage?: number | null
          previous_attempt_id?: string | null
          score?: number | null
          started_at?: string
          status?: string
          student_user_id?: string
          submitted_at?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_attempts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "learning_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_attempts_previous_attempt_id_fkey"
            columns: ["previous_attempt_id"]
            isOneToOne: false
            referencedRelation: "learning_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_attempts_tenant_id_organization_id_fkey"
            columns: ["tenant_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "learning_attempts_tenant_id_student_user_id_fkey"
            columns: ["tenant_id", "student_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      learning_class_groups: {
        Row: {
          academic_year_id: string
          code: string
          created_at: string
          curriculum_id: string
          grade_level_id: string
          id: string
          name: string
          organization_id: string
          status: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          code: string
          created_at?: string
          curriculum_id: string
          grade_level_id: string
          id?: string
          name: string
          organization_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          code?: string
          created_at?: string
          curriculum_id?: string
          grade_level_id?: string
          id?: string
          name?: string
          organization_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_curriculum_fk"
            columns: ["curriculum_id", "grade_level_id"]
            isOneToOne: false
            referencedRelation: "learning_grade_levels"
            referencedColumns: ["curriculum_id", "id"]
          },
          {
            foreignKeyName: "class_grade_fk"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "learning_grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_year_curriculum_fk"
            columns: ["academic_year_id", "curriculum_id"]
            isOneToOne: false
            referencedRelation: "learning_academic_years"
            referencedColumns: ["id", "curriculum_id"]
          },
          {
            foreignKeyName: "class_year_org_fk"
            columns: ["organization_id", "academic_year_id"]
            isOneToOne: false
            referencedRelation: "learning_academic_years"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      learning_class_subjects: {
        Row: {
          class_group_id: string
          created_at: string
          id: string
          organization_id: string
          status: string
          subject_id: string
          updated_at: string
        }
        Insert: {
          class_group_id: string
          created_at?: string
          id?: string
          organization_id: string
          status?: string
          subject_id: string
          updated_at?: string
        }
        Update: {
          class_group_id?: string
          created_at?: string
          id?: string
          organization_id?: string
          status?: string
          subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_subject_org_fk"
            columns: ["organization_id", "class_group_id"]
            isOneToOne: false
            referencedRelation: "learning_class_groups"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "learning_class_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "learning_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_content_items: {
        Row: {
          code: string
          content_type: string
          created_at: string
          created_by: string
          id: string
          language_code: string
          metadata: Json
          organization_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          content_type: string
          created_at?: string
          created_by: string
          id?: string
          language_code?: string
          metadata?: Json
          organization_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          content_type?: string
          created_at?: string
          created_by?: string
          id?: string
          language_code?: string
          metadata?: Json
          organization_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_content_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_content_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_content_items_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_content_items_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_content_objectives: {
        Row: {
          content_item_id: string
          created_at: string
          objective_id: string
          sequence_no: number
        }
        Insert: {
          content_item_id: string
          created_at?: string
          objective_id: string
          sequence_no?: number
        }
        Update: {
          content_item_id?: string
          created_at?: string
          objective_id?: string
          sequence_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_content_objectives_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "learning_content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_content_objectives_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "learning_objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_content_versions: {
        Row: {
          body: Json
          change_summary: string | null
          content_item_id: string
          created_at: string
          created_by: string
          id: string
          published_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          version_no: number
        }
        Insert: {
          body?: Json
          change_summary?: string | null
          content_item_id: string
          created_at?: string
          created_by: string
          id?: string
          published_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          version_no: number
        }
        Update: {
          body?: Json
          change_summary?: string | null
          content_item_id?: string
          created_at?: string
          created_by?: string
          id?: string
          published_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_content_versions_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "learning_content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_content_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_content_versions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_countries: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          native_name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          native_name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          native_name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_curricula: {
        Row: {
          code: string
          created_at: string
          description: string | null
          education_system_id: string
          id: string
          name: string
          status: string
          updated_at: string
          version: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          education_system_id: string
          id?: string
          name: string
          status?: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          education_system_id?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_curricula_education_system_id_fkey"
            columns: ["education_system_id"]
            isOneToOne: false
            referencedRelation: "learning_education_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_curriculum_subjects: {
        Row: {
          code: string | null
          created_at: string
          curriculum_id: string
          id: string
          name: string | null
          status: string
          subject_id: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          curriculum_id: string
          id?: string
          name?: string | null
          status?: string
          subject_id: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          curriculum_id?: string
          id?: string
          name?: string | null
          status?: string
          subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_subject_curriculum_fk"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "learning_curricula"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_curriculum_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "learning_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_education_systems: {
        Row: {
          code: string
          country_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          country_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          country_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_education_systems_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "learning_countries"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_grade_levels: {
        Row: {
          code: string
          created_at: string
          curriculum_id: string
          description: string | null
          id: string
          name: string
          sequence_no: number
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          curriculum_id: string
          description?: string | null
          id?: string
          name: string
          sequence_no: number
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          curriculum_id?: string
          description?: string | null
          id?: string
          name?: string
          sequence_no?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grade_curriculum_fk"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "learning_curricula"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_mastery_events: {
        Row: {
          attempt_id: string | null
          created_at: string
          evidence: Json
          id: string
          new_score: number
          objective_id: string
          organization_id: string | null
          previous_score: number | null
          student_user_id: string
          tenant_id: string
        }
        Insert: {
          attempt_id?: string | null
          created_at?: string
          evidence?: Json
          id?: string
          new_score: number
          objective_id: string
          organization_id?: string | null
          previous_score?: number | null
          student_user_id: string
          tenant_id: string
        }
        Update: {
          attempt_id?: string | null
          created_at?: string
          evidence?: Json
          id?: string
          new_score?: number
          objective_id?: string
          organization_id?: string | null
          previous_score?: number | null
          student_user_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_mastery_events_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "learning_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_mastery_events_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "learning_objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_mastery_events_tenant_id_organization_id_fkey"
            columns: ["tenant_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "learning_mastery_events_tenant_id_student_user_id_fkey"
            columns: ["tenant_id", "student_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      learning_objective_alignments: {
        Row: {
          created_at: string
          curriculum_id: string
          grade_level_id: string
          id: string
          notes: string | null
          objective_id: string
          required: boolean
          sequence_no: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          curriculum_id: string
          grade_level_id: string
          id?: string
          notes?: string | null
          objective_id: string
          required?: boolean
          sequence_no?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          curriculum_id?: string
          grade_level_id?: string
          id?: string
          notes?: string | null
          objective_id?: string
          required?: boolean
          sequence_no?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_objective_alignments_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "learning_curricula"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_objective_alignments_curriculum_id_grade_level_id_fkey"
            columns: ["curriculum_id", "grade_level_id"]
            isOneToOne: false
            referencedRelation: "learning_grade_levels"
            referencedColumns: ["curriculum_id", "id"]
          },
          {
            foreignKeyName: "learning_objective_alignments_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "learning_objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_objective_prerequisites: {
        Row: {
          created_at: string
          objective_id: string
          prerequisite_objective_id: string
        }
        Insert: {
          created_at?: string
          objective_id: string
          prerequisite_objective_id: string
        }
        Update: {
          created_at?: string
          objective_id?: string
          prerequisite_objective_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_objective_prerequisites_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "learning_objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_objective_prerequisites_prerequisite_objective_id_fkey"
            columns: ["prerequisite_objective_id"]
            isOneToOne: false
            referencedRelation: "learning_objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_objectives: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          sequence_no: number
          status: string
          topic_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sequence_no?: number
          status?: string
          topic_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sequence_no?: number
          status?: string
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_objectives_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "learning_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_question_evaluation_keys: {
        Row: {
          created_at: string
          evaluation_key: Json
          question_version_id: string
          scoring_rules: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          evaluation_key?: Json
          question_version_id: string
          scoring_rules?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          evaluation_key?: Json
          question_version_id?: string
          scoring_rules?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_question_evaluation_keys_question_version_id_fkey"
            columns: ["question_version_id"]
            isOneToOne: true
            referencedRelation: "learning_question_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_question_objectives: {
        Row: {
          created_at: string
          objective_id: string
          question_version_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          objective_id: string
          question_version_id: string
          weight?: number
        }
        Update: {
          created_at?: string
          objective_id?: string
          question_version_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_question_objectives_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "learning_objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_question_objectives_question_version_id_fkey"
            columns: ["question_version_id"]
            isOneToOne: false
            referencedRelation: "learning_question_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_question_versions: {
        Row: {
          configuration: Json
          created_at: string
          created_by: string
          explanation: Json | null
          id: string
          prompt: Json
          published_at: string | null
          question_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          updated_at: string
          version_no: number
        }
        Insert: {
          configuration?: Json
          created_at?: string
          created_by: string
          explanation?: Json | null
          id?: string
          prompt?: Json
          published_at?: string | null
          question_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string
          version_no: number
        }
        Update: {
          configuration?: Json
          created_at?: string
          created_by?: string
          explanation?: Json | null
          id?: string
          prompt?: Json
          published_at?: string | null
          question_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_question_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_question_versions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "learning_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_question_versions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_questions: {
        Row: {
          code: string
          created_at: string
          created_by: string
          id: string
          language_code: string
          organization_id: string | null
          question_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          id?: string
          language_code?: string
          organization_id?: string | null
          question_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          id?: string
          language_code?: string
          organization_id?: string | null
          question_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_questions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_questions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_questions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_recommendations: {
        Row: {
          assessment_id: string | null
          completed_at: string | null
          content_item_id: string | null
          created_at: string
          expires_at: string | null
          generated_at: string
          id: string
          objective_id: string | null
          organization_id: string | null
          priority: number
          reason: Json
          recommendation_type: string
          status: string
          student_user_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          assessment_id?: string | null
          completed_at?: string | null
          content_item_id?: string | null
          created_at?: string
          expires_at?: string | null
          generated_at?: string
          id?: string
          objective_id?: string | null
          organization_id?: string | null
          priority?: number
          reason?: Json
          recommendation_type: string
          status?: string
          student_user_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          assessment_id?: string | null
          completed_at?: string | null
          content_item_id?: string | null
          created_at?: string
          expires_at?: string | null
          generated_at?: string
          id?: string
          objective_id?: string | null
          organization_id?: string | null
          priority?: number
          reason?: Json
          recommendation_type?: string
          status?: string
          student_user_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_recommendations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "learning_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_recommendations_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "learning_content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_recommendations_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "learning_objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_recommendations_tenant_id_organization_id_fkey"
            columns: ["tenant_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "learning_recommendations_tenant_id_student_user_id_fkey"
            columns: ["tenant_id", "student_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      learning_skills: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          subject_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          subject_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_skills_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "learning_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_student_mastery: {
        Row: {
          attempts_count: number
          confidence_score: number
          correct_count: number
          created_at: string
          id: string
          last_assessed_at: string | null
          mastery_score: number
          next_review_at: string | null
          objective_id: string
          organization_id: string | null
          state: string
          student_user_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          attempts_count?: number
          confidence_score?: number
          correct_count?: number
          created_at?: string
          id?: string
          last_assessed_at?: string | null
          mastery_score?: number
          next_review_at?: string | null
          objective_id: string
          organization_id?: string | null
          state?: string
          student_user_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          attempts_count?: number
          confidence_score?: number
          correct_count?: number
          created_at?: string
          id?: string
          last_assessed_at?: string | null
          mastery_score?: number
          next_review_at?: string | null
          objective_id?: string
          organization_id?: string | null
          state?: string
          student_user_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_student_mastery_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "learning_objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_student_mastery_tenant_id_organization_id_fkey"
            columns: ["tenant_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "learning_student_mastery_tenant_id_student_user_id_fkey"
            columns: ["tenant_id", "student_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      learning_subjects: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_terms: {
        Row: {
          academic_year_id: string
          code: string
          created_at: string
          ends_on: string
          id: string
          name: string
          organization_id: string
          sequence_no: number
          starts_on: string
          status: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          code: string
          created_at?: string
          ends_on: string
          id?: string
          name: string
          organization_id: string
          sequence_no: number
          starts_on: string
          status?: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          code?: string
          created_at?: string
          ends_on?: string
          id?: string
          name?: string
          organization_id?: string
          sequence_no?: number
          starts_on?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "term_org_year_fk"
            columns: ["organization_id", "academic_year_id"]
            isOneToOne: false
            referencedRelation: "learning_academic_years"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      learning_topics: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          sequence_no: number
          skill_id: string
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sequence_no?: number
          skill_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sequence_no?: number
          skill_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_topics_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "learning_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_memberships: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role_id: string | null
          status: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role_id?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role_id?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_org_fk"
            columns: ["tenant_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "organization_memberships_role_fk"
            columns: ["tenant_id", "role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "organization_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_user_fk"
            columns: ["tenant_id", "user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      organizations: {
        Row: {
          code: string
          country: string
          created_at: string
          currency: string
          id: string
          name: string
          status: string
          tenant_id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          code: string
          country: string
          created_at?: string
          currency: string
          id?: string
          name: string
          status?: string
          tenant_id: string
          timezone: string
          updated_at?: string
        }
        Update: {
          code?: string
          country?: string
          created_at?: string
          currency?: string
          id?: string
          name?: string
          status?: string
          tenant_id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          provider: string | null
          reference: string | null
          sales_order_id: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at: string
          id: string
          method: string
          provider?: string | null
          reference?: string | null
          sales_order_id: string
          status?: string
          tenant_id: string
          updated_at: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          provider?: string | null
          reference?: string | null
          sales_order_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          brand_id: string | null
          category_id: string | null
          cost_price: number
          created_at: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          product_type: string
          selling_price: number
          sku: string
          status: string
          store_id: string | null
          tax_id: string | null
          tenant_id: string
          track_inventory: boolean
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          brand_id?: string | null
          category_id?: string | null
          cost_price?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          product_type?: string
          selling_price?: number
          sku: string
          status?: string
          store_id?: string | null
          tax_id?: string | null
          tenant_id: string
          track_inventory?: boolean
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          brand_id?: string | null
          category_id?: string | null
          cost_price?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          product_type?: string
          selling_price?: number
          sku?: string
          status?: string
          store_id?: string | null
          tax_id?: string | null
          tenant_id?: string
          track_inventory?: boolean
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          line_total: number
          notes: string | null
          product_id: string
          purchase_order_id: string
          quantity: number
          received_quantity: number
          tax_amount: number
          tax_rate: number
          tenant_id: string
          unit_cost: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          line_total?: number
          notes?: string | null
          product_id: string
          purchase_order_id: string
          quantity?: number
          received_quantity?: number
          tax_amount?: number
          tax_rate?: number
          tenant_id: string
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number
          notes?: string | null
          product_id?: string
          purchase_order_id?: string
          quantity?: number
          received_quantity?: number
          tax_amount?: number
          tax_rate?: number
          tenant_id?: string
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          order_number: string
          status: string
          store_id: string | null
          subtotal: number
          supplier_id: string
          tax_amount: number
          tenant_id: string
          total_amount: number
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number: string
          status?: string
          store_id?: string | null
          subtotal?: number
          supplier_id: string
          tax_amount?: number
          tenant_id: string
          total_amount?: number
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: string
          status?: string
          store_id?: string | null
          subtotal?: number
          supplier_id?: string
          tax_amount?: number
          tenant_id?: string
          total_amount?: number
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_return_items: {
        Row: {
          created_at: string
          id: string
          line_total: number
          product_id: string
          purchase_order_item_id: string
          purchase_return_id: string
          quantity: number
          reason: string | null
          tenant_id: string
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          line_total?: number
          product_id: string
          purchase_order_item_id: string
          purchase_return_id: string
          quantity: number
          reason?: string | null
          tenant_id: string
          unit_cost?: number
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number
          product_id?: string
          purchase_order_item_id?: string
          purchase_return_id?: string
          quantity?: number
          reason?: string | null
          tenant_id?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_return_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_return_items_purchase_order_item_id_fkey"
            columns: ["purchase_order_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_return_items_purchase_return_id_fkey"
            columns: ["purchase_return_id"]
            isOneToOne: false
            referencedRelation: "purchase_returns"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_returns: {
        Row: {
          created_at: string
          id: string
          purchase_order_id: string
          reason: string | null
          return_number: string
          status: string
          store_id: string
          supplier_id: string
          tenant_id: string
          total_amount: number
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          purchase_order_id: string
          reason?: string | null
          return_number: string
          status?: string
          store_id: string
          supplier_id: string
          tenant_id: string
          total_amount?: number
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          created_at?: string
          id?: string
          purchase_order_id?: string
          reason?: string | null
          return_number?: string
          status?: string
          store_id?: string
          supplier_id?: string
          tenant_id?: string
          total_amount?: number
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_returns_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_returns_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_returns_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          id: string
          name: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_order_items: {
        Row: {
          created_at: string
          discount_amount: number
          id: string
          line_total: number
          product_id: string
          quantity: number
          sales_order_id: string
          tax_rate: number
          tenant_id: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_amount?: number
          id?: string
          line_total?: number
          product_id: string
          quantity: number
          sales_order_id: string
          tax_rate?: number
          tenant_id: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_amount?: number
          id?: string
          line_total?: number
          product_id?: string
          quantity?: number
          sales_order_id?: string
          tax_rate?: number
          tenant_id?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_items_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_orders: {
        Row: {
          created_at: string
          customer_id: string | null
          discount_amount: number
          id: string
          notes: string | null
          order_number: string
          payment_status: string
          status: string
          store_id: string | null
          subtotal: number
          tax_amount: number
          tenant_id: string
          total_amount: number
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          order_number: string
          payment_status?: string
          status?: string
          store_id?: string | null
          subtotal?: number
          tax_amount?: number
          tenant_id: string
          total_amount?: number
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_status?: string
          status?: string
          store_id?: string | null
          subtotal?: number
          tax_amount?: number
          tenant_id?: string
          total_amount?: number
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: []
      }
      supplier_credit_ledger: {
        Row: {
          created_at: string
          credit: number
          debit: number
          description: string | null
          entry_type: string
          id: string
          reference_id: string | null
          reference_number: string | null
          reference_type: string | null
          store_id: string
          supplier_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          credit?: number
          debit?: number
          description?: string | null
          entry_type: string
          id?: string
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          store_id: string
          supplier_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          credit?: number
          debit?: number
          description?: string | null
          entry_type?: string
          id?: string
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          store_id?: string
          supplier_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_credit_ledger_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          notes: string | null
          paid_at: string
          payment_number: string
          reference: string | null
          status: string
          store_id: string
          supplier_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method: string
          notes?: string | null
          paid_at?: string
          payment_number: string
          reference?: string | null
          status?: string
          store_id: string
          supplier_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          notes?: string | null
          paid_at?: string
          payment_number?: string
          reference?: string | null
          status?: string
          store_id?: string
          supplier_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          payment_terms: string | null
          phone: string | null
          status: string
          store_id: string
          tax_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          payment_terms?: string | null
          phone?: string | null
          status?: string
          store_id: string
          tax_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          payment_terms?: string | null
          phone?: string | null
          status?: string
          store_id?: string
          tax_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          country: string
          created_at: string | null
          currency: string
          id: string
          name: string
        }
        Insert: {
          country: string
          created_at?: string | null
          currency: string
          id?: string
          name: string
        }
        Update: {
          country?: string
          created_at?: string | null
          currency?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          store_id: string
          symbol: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          store_id: string
          symbol: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          store_id?: string
          symbol?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          address: string
          city: string
          code: string
          country: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          manager_name: string | null
          name: string
          phone: string | null
          postal_code: string
          province: string
          store_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string
          city?: string
          code: string
          country?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          manager_name?: string | null
          name: string
          phone?: string | null
          postal_code?: string
          province?: string
          store_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          code?: string
          country?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          manager_name?: string | null
          name?: string
          phone?: string | null
          postal_code?: string
          province?: string
          store_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_permissions: {
        Args: never
        Returns: {
          permission_code: string
        }[]
      }
      get_current_user_tenant_id: { Args: never; Returns: string }
      has_permission: { Args: { permission_code: string }; Returns: boolean }
      is_organization_member: {
        Args: { target_organization_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
